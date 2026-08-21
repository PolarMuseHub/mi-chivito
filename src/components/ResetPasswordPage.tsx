import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Mail, ArrowRight, Check } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    // Check if this is a password reset callback
    // Supabase sends tokens in the URL hash (fragment), not query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    // Check both hash and query params (hash takes precedence)
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const type = hashParams.get('type') || queryParams.get('type');
    const error = hashParams.get('error') || queryParams.get('error');
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

    console.log('URL params:', { accessToken, refreshToken, type, error, errorDescription });

    if (error) {
      setError(errorDescription || 'Token de acceso no válido. Por favor, solicita un nuevo enlace de restablecimiento.');
      setIsValidToken(false);
      setShowRequestForm(true);
      return;
    }

    if (type === 'recovery' && accessToken && refreshToken) {
      // This is a valid password reset callback
      setIsValidToken(true);
      
      // Set the session with the tokens but don't redirect
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          setError('Error al validar el enlace de restablecimiento');
          setIsValidToken(false);
          setShowRequestForm(true);
        } else {
          // Session is set, but we want to force password change
          console.log('Recovery session established, requiring password change');
        }
      });
    } else {
      // No valid tokens, show the request form
      setIsValidToken(false);
      setShowRequestForm(true);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use production URL if available, otherwise use current origin
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const redirectUrl = `${appUrl}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        throw error;
      }

      setRequestSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de restablecimiento');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswords = () => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Clear the URL hash and parameters to prevent confusion
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Ocurrió un error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = password.length >= 8 && password === confirmPassword;

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
        <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md p-7 text-center">
          <div className="mx-auto w-[76px] h-[76px] bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
            <img
              src="/icons/android-chrome-192x192.png"
              alt="Mi Chivito Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Validando enlace...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
        <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md p-7 text-center">
          <div className="mx-auto w-[76px] h-[76px] bg-[#E8F3EC] rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-[#2E7D5B]" />
          </div>

          <h1 className="font-['Fraunces'] text-2xl font-bold text-[#241B14] mb-2">
            ¡Contraseña actualizada!
          </h1>

          <p className="text-[#8A7F72] mb-6 text-sm leading-relaxed">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido a la página principal en unos segundos.
          </p>

          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Request sent state
  if (requestSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
        <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md p-7 text-center flex flex-col items-center pt-16">
          <div className="w-[76px] h-[76px] bg-[#E8F3EC] rounded-full flex items-center justify-center mb-5">
            <Mail className="w-9 h-9 text-[#2E7D5B]" />
          </div>

          <h1 className="font-['Fraunces'] text-2xl font-bold text-[#241B14] mb-2">
            Revisa tu correo
          </h1>

          <p className="text-[#8A7F72] mb-6 text-sm leading-relaxed">
            Enviamos un enlace para restablecer tu contraseña a <span className="font-extrabold text-[#241B14]">{email}</span>.
          </p>

          <p className="text-xs text-[#8A7F72] font-semibold">¿No llegó? <a href="#" onClick={handleRequestReset} className="text-[#E2610F] font-extrabold no-underline hover:underline">Reenviar correo</a></p>

          <button
            onClick={() => navigate('/')}
            className="mt-auto w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Request reset form (when no valid token)
  if (showRequestForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
        <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md p-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9552] to-[#E2610F] flex items-center justify-center shadow-lg shadow-orange/30 mb-5">
            <Lock className="w-8 h-8 text-white" strokeWidth={2.2} />
          </div>

          <h1 className="font-['Fraunces'] text-[25px] font-bold text-[#241B14] mb-2">
              ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-sm text-[#8A7F72] font-medium leading-relaxed mb-7">
            No hay problema. Escribe tu correo y te mandamos un enlace para crear una nueva.
          </p>

          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold mb-2 text-[#241B14]">
                Correo Electrónico
              </label>
              <div className="input-wrap group">
                <Mail className="text-[#B7AB9C] group-focus-within:text-[#FF7A2E] w-5 h-5 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-3 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[15px] py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-b from-[#FF8A42] to-[#E2610F]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar enlace
                  <ArrowRight className="w-5 h-5" strokeWidth={2.4} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-bold text-sm text-[#E2610F] hover:underline transition-all"
              disabled={isLoading}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form (when valid token exists)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
      <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md p-7">
        <button onClick={() => setShowRequestForm(true)} className="w-9 h-9 rounded-full bg-[#FFF8F2] flex items-center justify-center text-[#241B14] mb-7 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9552] to-[#E2610F] flex items-center justify-center shadow-lg shadow-orange/30 mb-5">
          <Lock className="w-8 h-8 text-white" strokeWidth={2.2} />
        </div>

        <h1 className="font-['Fraunces'] text-[25px] font-bold text-[#241B14] mb-2">
            Restablecer contraseña
        </h1>
        <p className="text-sm text-[#8A7F72] font-medium leading-relaxed mb-7">
            Ingresa tu nueva contraseña para acceder a tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold mb-2 text-[#241B14]">
              Nueva contraseña
            </label>
            <div className="input-wrap group relative">
              <Lock className="text-[#B7AB9C] group-focus-within:text-[#FF7A2E] w-5 h-5 transition-colors" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange transition-colors p-1"
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold mb-2 text-[#241B14]">
              Confirmar contraseña
            </label>
            <div className="input-wrap group relative">
              <Lock className="text-[#B7AB9C] group-focus-within:text-[#FF7A2E] w-5 h-5 transition-colors" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange transition-colors p-1"
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password validation feedback */}
          {password && (
            <div className="space-y-1 pt-1">
              <div className={`flex items-center gap-2 text-sm ${
                password.length >= 8 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {password.length >= 8 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                )}
                <span className={password.length >= 8 ? 'font-bold' : ''}>
                  Al menos 8 caracteres
                </span>
              </div>

              {confirmPassword && (
                <div className={`flex items-center gap-2 text-sm ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-500'
                }`}>
                  {password === confirmPassword ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-red-300 rounded-full"></div>
                  )}
                  <span className={password === confirmPassword ? 'font-bold' : ''}>
                    Las contraseñas coinciden
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[15px] py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-b from-[#FF8A42] to-[#E2610F]"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando contraseña...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Actualizar contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;