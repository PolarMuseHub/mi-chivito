import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'ELIMINAR') {
      setError('Por favor escribe "ELIMINAR" para confirmar');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError('Error al eliminar la cuenta. Por favor intenta de nuevo.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Eliminar Cuenta
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Esta acción es permanente e irreversible
              </h3>
              <p className="text-sm text-red-800 leading-relaxed">
                Al eliminar tu cuenta, se borrarán de forma permanente todos tus datos:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 mt-2 space-y-1 ml-2">
                <li>Todas tus transacciones (ingresos, gastos, deudas, ahorros)</li>
                <li>Tu historial financiero completo</li>
                <li>Tus metas y presupuestos</li>
                <li>Tu información de perfil y preferencias</li>
                <li>Tu suscripción activa (si aplica)</li>
              </ul>
            </div>

            <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
              <h3 className="font-semibold text-sage-900 mb-2">
                Derechos del Usuario (Conforme a regulación mexicana)
              </h3>
              <p className="text-sm text-sage-800 leading-relaxed">
                De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de Particulares,
                ejerces tu derecho de cancelación de datos. Una vez confirmada la eliminación:
              </p>
              <ul className="list-disc list-inside text-sm text-sage-800 mt-2 space-y-1 ml-2">
                <li>Tus datos personales serán eliminados de nuestros sistemas</li>
                <li>No podrás recuperar esta información posteriormente</li>
                <li>Podrás crear una nueva cuenta en el futuro si lo deseas</li>
                <li>El proceso de eliminación es inmediato</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Cuenta a eliminar:</strong>
              </p>
              <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded mt-2 border">
                {userEmail}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe <strong>ELIMINAR</strong> en el campo:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError(null);
                }}
                placeholder="ELIMINAR"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== 'ELIMINAR'}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Eliminar mi cuenta
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Si tienes dudas, contacta a soporte antes de eliminar tu cuenta
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
