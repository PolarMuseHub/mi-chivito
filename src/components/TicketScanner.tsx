import React, { useState, useRef } from 'react';
import { Camera, X, Sparkles } from 'lucide-react';

interface TicketData {
  comercio: string | null;
  fecha: string | null;
  monto_total: number;
  moneda: string;
  categoria_sugerida: string | null;
  items?: Array<{ nombre: string; precio: number }>;
  confianza: number;
}

interface TicketScannerProps {
  onDataExtracted: (data: TicketData) => void;
}

const TicketScanner: React.FC<TicketScannerProps> = ({ onDataExtracted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 10MB.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreview(base64);

        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const response = await fetch(`${supabaseUrl}/functions/v1/process-receipt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ image: base64.split(',')[1] }),
          });

          const result = await response.json();

          if (!response.ok) {
            if (result.lowConfidence) {
              throw new Error('Análisis incompleto. Por favor verifica los datos o toma una foto más clara.');
            }
            throw new Error(result.error || 'Error al procesar ticket');
          }

          if (result.data.confianza < 0.6) {
            setError('Análisis con baja confianza. Por favor verifica los datos extraídos.');
          }

          onDataExtracted(result.data);
          setTimeout(() => setPreview(null), 2000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al procesar ticket');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al leer la imagen');
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => setShowPremiumModal(true)}
        disabled={loading}
        className="w-full bg-black text-white font-bold py-3 px-6 rounded-2xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 relative shadow-md"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Procesando con Google AI (3-5 seg)...</span>
          </>
        ) : (
          <>
            <Camera size={20} />
            <span>Escanear Ticket</span>
            <span className="inline-flex items-center gap-1 bg-orange-light text-orange-dark text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 uppercase tracking-wide">
              <Sparkles size={10} />
              Premium
            </span>
          </>
        )}
      </button>

      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPremiumModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
              <Sparkles size={22} className="text-amber-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Funcion Premium
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Disponible gratis durante el periodo de prueba.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 py-3 px-4 text-sm font-bold text-[#241B14] bg-[#FFF8F2] border border-[#F1E4D7] rounded-xl hover:bg-[#F5EBE1] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPremiumModal(false);
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-3 px-4 text-sm font-bold text-white bg-gradient-to-b from-[#FF8A42] to-[#E2610F] rounded-xl hover:opacity-95 shadow-md shadow-orange/20 transition-all"
              >
                Continuar &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {preview && (
        <div className="mt-3 relative rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Ticket preview"
            className="w-full h-32 object-cover border-2 border-sage-500"
          />
          <div className="absolute inset-0 bg-sage-500 bg-opacity-20 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-sage-600 px-4 py-2 rounded-lg">
              ✓ Escaneado
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        Toma foto del ticket o selecciona de galería. Procesamiento automático con Google Cloud Document AI.
      </p>
    </div>
  );
};

export default TicketScanner;
