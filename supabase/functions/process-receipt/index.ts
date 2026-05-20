import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  image: string;
}

interface GoogleAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface DocumentAIEntity {
  type: string;
  mentionText?: string;
  normalizedValue?: {
    text?: string;
    dateValue?: {
      year?: number;
      month?: number;
      day?: number;
    };
    moneyValue?: {
      units?: string;
      nanos?: number;
      currencyCode?: string;
    };
  };
  confidence?: number;
}

interface DocumentAIResponse {
  document?: {
    entities?: DocumentAIEntity[];
    text?: string;
  };
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);

  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: serviceAccount.private_key_id,
  };

  const claimSet = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedClaim = btoa(JSON.stringify(claimSet)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${encodedSignature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token error:', errorText);
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const tokenData: GoogleAuthToken = await tokenResponse.json();
  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .trim();

  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function extractEntityValue(entities: DocumentAIEntity[], type: string): string | null {
  const entity = entities.find(e => e.type === type);
  if (!entity) return null;

  if (entity.normalizedValue?.text) {
    return entity.normalizedValue.text;
  }

  if (entity.normalizedValue?.dateValue) {
    const date = entity.normalizedValue.dateValue;
    if (date.year && date.month && date.day) {
      return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    }
  }

  if (entity.normalizedValue?.moneyValue) {
    const money = entity.normalizedValue.moneyValue;
    const units = parseFloat(money.units || '0');
    const nanos = (money.nanos || 0) / 1000000000;
    return (units + nanos).toString();
  }

  if (entity.mentionText) {
    return entity.mentionText;
  }

  return null;
}

async function categorizeWithGemini(
  merchantName: string,
  documentText: string,
  apiKey: string
): Promise<{subcategoryId: string, subcategoryName: string, mainCategoryId: string}> {

  const prompt = `Mexican personal finance categorizer.
Return ONLY valid JSON: {"subcategoryId":"","subcategoryName":"","mainCategoryId":""}
No markdown. No explanation.

Merchant: ${merchantName}
Text: ${documentText.slice(0, 200)}

Categories:
VS1|Vivienda y Servicios|Renta/Hipoteca
VS2-1|Vivienda y Servicios|Luz
VS2-2|Vivienda y Servicios|Agua
VS2-3|Vivienda y Servicios|Gas
VS2-4|Vivienda y Servicios|Otros Servicios
VS3-1|Vivienda y Servicios|Plomería
VS3-2|Vivienda y Servicios|Electricidad/Reparaciones
VS3-3|Vivienda y Servicios|Jardinería/Limpieza
VS3-4|Vivienda y Servicios|Muebles y Decoración
VS3-5|Vivienda y Servicios|Otros Mantenimiento
AB1-1|Alimentos|Despensa/Supermercado
AB1-2|Alimentos|Mercado/Carnicería/Frutería
AB1-3|Alimentos|Agua Purificada
AB2-1|Alimentos|Tienda/Oxxo/7-Eleven
AB2-2|Alimentos|Café/Panadería
AB2-3|Alimentos|Comida Rápida
AB3-1|Alimentos|Restaurantes
AB3-2|Alimentos|Apps Delivery
AB3-3|Alimentos|Bares/Alcohol
AB3-4|Alimentos|Otros Restaurantes
TR1-1|Transporte|Gasolina
TR1-2|Transporte|Autolavado
TR1-3|Transporte|Accesorios Auto
TR1-4|Transporte|Otros Automóvil
TR2-1|Transporte|Servicio Mecánico
TR2-2|Transporte|Llantas/Suspensión
TR2-3|Transporte|Hojalatería/Pintura
TR2-4|Transporte|Otros Mantenimiento Auto
TR3-1|Transporte|Uber/Didi/Cabify
TR3-2|Transporte|Transporte Público
TR3-3|Transporte|Otros Transporte
TR4-1|Transporte|Estacionamiento
TR4-2|Transporte|Peajes/Casetas
TR4-3|Transporte|Seguro Auto
TR4-4|Transporte|Tenencia/Verificación
TR4-5|Transporte|Otros Trámites Auto
SB1-1|Salud|Consulta Médica
SB1-2|Salud|Dentista
SB1-3|Salud|Terapia
SB1-4|Salud|Laboratorio
SB1-5|Salud|Otros Salud
SB2-1|Salud|Medicamentos
SB2-2|Salud|Vitaminas/Suplementos
SB2-3|Salud|Otros Farmacia
SB3-1|Salud|Barbería/Estética
SB3-2|Salud|Cosméticos/Higiene
SB3-3|Salud|Lentes/Óptica
SB3-4|Salud|Gimnasio/Deportes
SB3-5|Salud|Otros Cuidado Personal
EF1-1|Educación|Colegiatura
EF1-2|Educación|Inscripción
EF1-3|Educación|Cursos Extra
EF1-4|Educación|Otros Educación
EF2-1|Educación|Útiles Escolares
EF2-2|Educación|Uniformes/Ropa Hijos
EF2-3|Educación|Juguetes/Actividades
EF2-4|Educación|Otros Gastos Hijos
EF3-1|Educación|Alimento Mascota
EF3-2|Educación|Veterinario/Vacunas
EF3-3|Educación|Accesorios Mascota
EF3-4|Educación|Otros Mascotas
TD1-1|Tecnología|Internet Hogar
TD1-2|Tecnología|Plan Celular
TD1-3|Tecnología|Software/Nube
TD1-4|Tecnología|Streaming
TD1-5|Tecnología|Otros Servicios Digitales
TD2-1|Tecnología|Computadora/Tablet
TD2-2|Tecnología|Celular
TD2-3|Tecnología|Accesorios Electrónicos
TD2-4|Tecnología|Otros Tecnología
FL1-1|Financiero|Tarjeta de Crédito
FL1-2|Financiero|Préstamo/Hipoteca
FL1-3|Financiero|Comisiones Bancarias
FL1-4|Financiero|Otros Financieros
FL2-1|Financiero|SAT/Impuestos
FL2-2|Financiero|Predial
FL2-3|Financiero|Trámites Gubernamentales
FL2-4|Financiero|Otros Legal
FL3-1|Financiero|Seguro Gastos Médicos
FL3-2|Financiero|Seguro de Vida
FL3-3|Financiero|Ahorro/Inversión
FL3-4|Financiero|Otros Seguros`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
      })
    }
  );

  if (!response.ok) throw new Error('Gemini API failed');
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim()
    .replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

Deno.serve(async (req: Request) => {
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

    const gcpServiceAccount = Deno.env.get("GCP_SERVICE_ACCOUNT");
    const gcpProcessorId = Deno.env.get("GCP_PROCESSOR_ID");
    const gcpProjectId = Deno.env.get("GCP_PROJECT_ID");

    console.log('[DEBUG] GCP_PROJECT_ID value:', gcpProjectId ?? 'UNDEFINED');
    console.log('[DEBUG] GCP_PROCESSOR_ID value:', gcpProcessorId ?? 'UNDEFINED');
    console.log('[DEBUG] GCP_SERVICE_ACCOUNT first 20 chars:', gcpServiceAccount ? gcpServiceAccount.substring(0, 20) : 'UNDEFINED');

    if (!gcpServiceAccount || !gcpProcessorId || !gcpProjectId) {
      console.error('Missing GCP configuration:', {
        hasServiceAccount: !!gcpServiceAccount,
        hasProcessorId: !!gcpProcessorId,
        hasProjectId: !!gcpProjectId
      });
      return new Response(
        JSON.stringify({ error: "Configuración de GCP incompleta. Verifica las variables de entorno." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Getting access token...');
    let accessToken: string;
    try {
      accessToken = await getAccessToken(gcpServiceAccount);
      console.log('Access token obtained successfully');
    } catch (error) {
      console.error('Failed to get access token:', error);
      return new Response(
        JSON.stringify({
          error: "Error de autenticación con Google Cloud",
          details: error.message
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

    // Accept both pure base64 and data URL format
    const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Default to JPEG if no data URL prefix detected
    let mimeType = "image/jpeg";
    if (image.includes('data:image/png')) {
      mimeType = "image/png";
    } else if (image.includes('data:image/webp')) {
      mimeType = "image/webp";
    }

    // Handle processor ID - could be just ID or full path
    const processorIdOnly = gcpProcessorId.includes('/')
      ? gcpProcessorId.split('/').pop()
      : gcpProcessorId;

    const apiUrl = `https://us-documentai.googleapis.com/v1/projects/${gcpProjectId}/locations/us/processors/${processorIdOnly}:process`;

    console.log('Calling Document AI:', apiUrl);

    const documentAIResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDocument: {
          content: cleanBase64,
          mimeType: mimeType,
        },
      }),
    });

    if (!documentAIResponse.ok) {
      const errorText = await documentAIResponse.text();
      console.error('[DEBUG] Document AI full error response - status:', documentAIResponse.status);
      console.error('[DEBUG] Document AI full error response - body:', errorText);
      return new Response(
        JSON.stringify({
          error: "Error al procesar con Document AI",
          details: errorText.substring(0, 200)
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

    const result: DocumentAIResponse = await documentAIResponse.json();
    console.log('Document AI response received');

    if (!result.document?.entities || result.document.entities.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No se pudieron extraer datos del ticket. Por favor toma una foto más clara.",
          lowConfidence: true
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const entities = result.document.entities;

    const merchantName = extractEntityValue(entities, 'supplier_name') ||
                        extractEntityValue(entities, 'merchant_name') ||
                        extractEntityValue(entities, 'receiver_name');

    const totalAmount = extractEntityValue(entities, 'total_amount') ||
                       extractEntityValue(entities, 'net_amount');

    const currency = extractEntityValue(entities, 'currency') || 'MXN';

    const receiptDate = extractEntityValue(entities, 'receipt_date') ||
                       extractEntityValue(entities, 'invoice_date') ||
                       extractEntityValue(entities, 'date');

    const taxAmount = extractEntityValue(entities, 'total_tax_amount') ||
                     extractEntityValue(entities, 'vat_amount');

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      return new Response(
        JSON.stringify({
          error: "No se encontró el monto total. Por favor verifica la imagen.",
          lowConfidence: true
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const documentText = result.document.text || '';

    let subcategoriaId = 'AB1-1';
    let subcategoriaNombre = 'Despensa/Supermercado';
    let mainCategoryId = 'AB';

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const cat = await categorizeWithGemini(
          merchantName || '',
          documentText,
          geminiKey
        );
        subcategoriaId = cat.subcategoryId;
        subcategoriaNombre = cat.subcategoryName;
        mainCategoryId = cat.mainCategoryId;
      } catch (e) {
        console.error('Categorization fallback:', e);
      }
    }

    const averageConfidence = entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / entities.length;

    const parsedData = {
      comercio: merchantName,
      fecha: receiptDate,
      monto_total: parseFloat(totalAmount),
      moneda: currency,
      subcategoria_id: subcategoriaId,
      subcategoria_nombre: subcategoriaNombre,
      mainCategoryId: mainCategoryId,
      tax_amount: taxAmount ? parseFloat(taxAmount) : null,
      items: [],
      confianza: averageConfidence,
    };

    console.log('Successfully parsed:', JSON.stringify(parsedData));

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
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
      JSON.stringify({
        error: error.message || "Error interno del servidor",
        details: "Por favor intenta de nuevo o contacta soporte"
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
});
