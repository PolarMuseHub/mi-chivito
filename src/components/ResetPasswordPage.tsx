import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Mail, ArrowRight, Check, Shield } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#f4a258]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#728c6a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-[#bed4cf]/20">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#f4a258' }}>
            <img
              src="/icons/android-chrome-192x192.png"
              alt="Mi Chivito Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="w-8 h-8 border-4 border-[#728c6a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Validando enlace...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#f4a258]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#728c6a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-[#bed4cf]/20">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#728c6a' }}>
            ¡Contraseña actualizada!
          </h1>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido a la página principal en unos segundos.
          </p>

          <div className="w-8 h-8 border-4 border-[#728c6a] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Request sent state
  if (requestSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#f4a258]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#728c6a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-[#bed4cf]/20">
          <div className="mx-auto w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-sage-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#728c6a' }}>
            ¡Correo enviado!
          </h1>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>.
            Revisa tu bandeja de entrada y haz clic en el enlace para continuar.
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: '#728c6a' }}
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#f4a258]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#728c6a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md border border-[#bed4cf]/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#f4a258' }}>
              <img
                src="/icons/android-chrome-192x192.png"
                alt="Mi Chivito Logo"
                className="w-14 h-14 object-contain"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#728c6a' }}>
              ¿Olvidaste tu contraseña?
            </h1>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#728c6a' }}>
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#728c6a] w-5 h-5 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#728c6a] focus:ring-4 focus:ring-[#728c6a]/10 transition-all bg-white"
                  placeholder="tu@correo.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: isLoading || !email.trim() ? '' : '#728c6a',
                opacity: isLoading || !email.trim() ? 0.5 : 1
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Enviar enlace de restablecimiento
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-medium transition-all hover:underline"
              style={{ color: '#728c6a' }}
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fcf3e5] via-[#fef7ed] to-[#bed4cf]/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#f4a258]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#728c6a]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md border border-[#bed4cf]/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: '#f4a258' }}>
            <img
              src="/icons/android-chrome-192x192.png"
              alt="Mi Chivito Logo"
              className="w-14 h-14 object-contain"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#728c6a' }}>
            Restablecer contraseña
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Ingresa tu nueva contraseña para acceder a tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#728c6a' }}>
              Nueva contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#728c6a] w-5 h-5 transition-colors" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#728c6a] focus:ring-4 focus:ring-[#728c6a]/10 transition-all bg-white"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#728c6a] transition-colors p-1"
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: '#728c6a' }}>
              Confirmar contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#728c6a] w-5 h-5 transition-colors" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#728c6a] focus:ring-4 focus:ring-[#728c6a]/10 transition-all bg-white"
                placeholder="Repite tu nueva contraseña"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#728c6a] transition-colors p-1"
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
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-sm ${
                password.length >= 8 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {password.length >= 8 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                )}
                <span className={password.length >= 8 ? 'font-medium' : ''}>
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
                  <span className={password === confirmPassword ? 'font-medium' : ''}>
                    Las contraseñas coinciden
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: isLoading || !isFormValid ? '' : '#728c6a',
              opacity: isLoading || !isFormValid ? 0.5 : 1
            }}
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

        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Importante</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Debes establecer una nueva contraseña para continuar. Una vez actualizada,
                  podrás acceder normalmente a tu cuenta con la nueva contraseña.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;