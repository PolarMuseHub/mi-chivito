import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, UserPlus, Shield, Check } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { trackEvent, EVENTS } from '../utils/analytics';

type AuthMode = 'login' | 'signup';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          trackEvent(EVENTS.AUTH_SIGN_UP, { email });
          setSuccessMessage('¡Cuenta creada con éxito! Bienvenido a Mi Chivito.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          trackEvent(EVENTS.AUTH_SESSION_STARTED, { email });
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage(null);
    setPassword('');
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const isFormValid = email.trim() && password.trim() && password.length >= 6;

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
            {mode === 'login' ? 'Bienvenido' : 'Únete a Mi Chivito'}
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {mode === 'login'
              ? 'Ingresa para gestionar tus finanzas personales'
              : 'Comienza tu viaje hacia la libertad financiera'
            }
          </p>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => mode !== 'login' && toggleMode()}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-[#728c6a] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isLoading}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => mode !== 'signup' && toggleMode()}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-white text-[#728c6a] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isLoading}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#728c6a' }}>
              Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#728c6a] w-5 h-5 transition-colors" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#728c6a] focus:ring-4 focus:ring-[#728c6a]/10 transition-all bg-white"
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                required
                minLength={6}
                disabled={isLoading}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

            {mode === 'login' && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium hover:underline transition-all"
                  style={{ color: '#728c6a' }}
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {mode === 'signup' && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {password.length >= 6 ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={password.length >= 6 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    Mínimo 6 caracteres
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Check className="w-5 h-5" />
                {successMessage}
              </p>
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
                {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </>
            ) : (
              <>
                {mode === 'login' ? (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <UserPlus className="w-5 h-5" />
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-gray-100">
          <div className="bg-gradient-to-br from-[#728c6a]/5 to-[#bed4cf]/10 border-2 border-[#728c6a]/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-[#728c6a]" />
              </div>
              <div>
                <h3 className="font-bold text-[#728c6a] mb-1">
                  {mode === 'login' ? 'Acceso Seguro' : 'Protección Total'}
                </h3>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  {mode === 'login' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#728c6a] flex-shrink-0" />
                        Encriptación de extremo a extremo
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#728c6a] flex-shrink-0" />
                        Sincronización automática y segura
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#728c6a] flex-shrink-0" />
                        Datos protegidos con encriptación
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#728c6a] flex-shrink-0" />
                        Acceso multiplataforma
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {mode === 'signup' && (
            <p className="text-xs text-gray-600 text-center mt-4">
              Al crear una cuenta, aceptas nuestros{' '}
              <button
                type="button"
                onClick={() => navigate('/terms-and-conditions')}
                className="text-[#728c6a] hover:underline font-medium"
              >
                Términos y Condiciones
              </button>
              {' '}y{' '}
              <button
                type="button"
                onClick={() => navigate('/privacy-policy')}
                className="text-[#728c6a] hover:underline font-medium"
              >
                Aviso de Privacidad
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;