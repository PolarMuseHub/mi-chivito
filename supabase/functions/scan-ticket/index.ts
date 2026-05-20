import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const TICKET_EXTRACTION_PROMPT = `Analiza esta imagen de un ticket de compra en México.
Extrae los datos y devuélvelos estrictamente en este formato JSON:
{
  "comercio": "Nombre del comercio/tienda",
  "fecha": "YYYY-MM-DD",
  "monto_total": 0.00,
  "moneda": "MXN",
  "categoria_sugerida": "Comida/Transporte/Hogar/Salud/Entretenimiento/Ropa/Servicios/Otros",
  "items": [
    {"nombre": "producto", "precio": 0.00}
  ],
  "confianza": 0.95
}

REGLAS:
- Si no puedes determinar algo, usa null
- monto_total debe ser el total final del ticket
- fecha en formato ISO (YYYY-MM-DD)
- categoria_sugerida debe ser una de las 8 opciones exactas
- confianza entre 0 y 1 (qué tan seguro estás de la extracción)
- items opcional pero útil
- moneda siempre MXN para México
- No añadas texto extra, markdown, ni explicaciones. Solo el JSON válido.`;

interface RequestBody {
  image: string;
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight FIRST, before any other logic
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { image }: RequestBody = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No se proporcionó imagen" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("MiChivito");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Strip Data URI prefix from the image before payload construction
    const cleanBase64 = image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

    // Detect mime type from base64 prefix
    let mimeType = "image/jpeg";
    if (image.includes('data:image/png')) {
      mimeType = "image/png";
    } else if (image.includes('data:image/jpg')) {
      mimeType = "image/jpeg";
    } else if (image.includes('data:image/webp')) {
      mimeType = "image/webp";
    }

    console.log('Calling Gemini API...');

    // Create abort controller with 45 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Gemini request timeout after 45s');
      controller.abort();
    }, 45000);

    let res;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: TICKET_EXTRACTION_PROMPT },
                { inline_data: { mime_type: mimeType, data: cleanBase64 } }
              ]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  comercio: { type: "STRING" },
                  fecha: { type: "STRING" },
                  monto_total: { type: "NUMBER" },
                  moneda: { type: "STRING" },
                  categoria_sugerida: { type: "STRING" },
                  items: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        nombre: { type: "STRING" },
                        precio: { type: "NUMBER" }
                      }
                    }
                  },
                  confianza: { type: "NUMBER" }
                },
                required: ["comercio", "monto_total", "categoria_sugerida", "confianza"]
              }
            }
          })
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'El análisis tomó demasiado tiempo. Intenta con una foto más clara o pequeña.' }),
          {
            status: 408,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Gemini API error:', res.status, errorText);

      // Parse error for more specific messages
      let errorMessage = "Error al procesar la imagen con Gemini";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          const message = errorData.error.message;
          if (message.includes("API key")) {
            errorMessage = "API key inválida o expirada";
          } else if (message.includes("quota")) {
            errorMessage = "Límite de uso de la API alcanzado";
          } else if (message.includes("invalid")) {
            errorMessage = "Formato de imagen inválido";
          }
        }
      } catch (e) {
        // Keep default message
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: res.status === 400 ? "Verifica que la imagen sea válida" : undefined
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Read full response with timeout protection
    let data;
    try {
      const responseText = await Promise.race([
        res.text(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Response read timeout')), 10000)
        )
      ]);
      data = JSON.parse(responseText);
    } catch (readError) {
      console.error('Response read error:', readError);
      return new Response(
        JSON.stringify({ error: 'Error al leer respuesta de Gemini' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Full Gemini response received');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text in Gemini response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No se pudo extraer datos del ticket' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Gemini Raw:', text);

    // Parse JSON (should already be valid since using responseSchema)
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', text);
      return new Response(
        JSON.stringify({ error: 'Respuesta de Gemini con formato inválido' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate required fields
    if (!parsed.monto_total || parsed.monto_total <= 0) {
      return new Response(
        JSON.stringify({ error: 'No se encontró el monto en el ticket' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Ensure defaults
    parsed.moneda = parsed.moneda || 'MXN';
    parsed.items = parsed.items || [];

    console.log('Successfully parsed:', JSON.stringify(parsed));

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
