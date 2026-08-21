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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EFE7DD]">
      <div className="bg-white rounded-[44px] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Hero Section */}
        <div className="hero-section relative text-center rounded-b-3xl px-7 pb-10 pt-2 bg-[radial-gradient(120%_100%_at_20%_0%,#FF9552_0%,#FF7A2E_45%,#E2610F_100%)]">
          <div className="pt-[50px] relative z-10">
            <div className="mx-auto w-[76px] h-[76px] bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
            <img
              src="/icons/android-chrome-192x192.png"
              alt="Mi Chivito Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
            <h1 className="text-2xl font-bold text-white font-['Fraunces']">
              {mode === 'login' ? 'Bienvenido' : 'Únete a Mi Chivito'}
            </h1>
            <p className="text-white/80 text-sm mt-1.5">
              {mode === 'login'
                ? 'Ingresa para gestionar tus finanzas personales'
                : 'Comienza tu viaje hacia la libertad financiera'
              }
            </p>
          </div>
          {/* Toggle */}
          <div className="relative z-10 flex gap-1 mt-5 p-1 bg-white/20 rounded-2xl">
          <button
            type="button"
            onClick={() => mode !== 'login' && toggleMode()}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              mode === 'login'
                ? 'bg-white text-[#E2610F] shadow-md'
                : 'text-white/80'
            }`}
            disabled={isLoading}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => mode !== 'signup' && toggleMode()}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              mode === 'signup'
                ? 'bg-white text-[#E2610F] shadow-md'
                : 'text-white/80'
            }`}
            disabled={isLoading}
          >
            Crear Cuenta
          </button>
        </div>

        </div>
        {/* Form Body */}
        <div className="p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label htmlFor="password" className="block text-xs font-bold mb-2 text-[#241B14]">
              Contraseña
            </label>
            <div className="input-wrap group relative">
              <Lock className="text-[#B7AB9C] group-focus-within:text-[#FF7A2E] w-5 h-5 transition-colors" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                required
                minLength={6}
                disabled={isLoading}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button // Botón para mostrar/ocultar contraseña
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
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-[#E2610F] hover:underline transition-all"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {password.length >= 6 ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={password.length >= 6 ? 'text-green-600 font-bold' : 'text-gray-500'}>
                    Mínimo 6 caracteres
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 animate-shake">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-3">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Check className="w-5 h-5" />
                {successMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[15px] py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-b from-[#FF8A42] to-[#E2610F]"
            
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

        <div className="mt-5">
          <div className="bg-[#EAF5EF] border border-[#D9EBE1] rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-2 bg-[#2E7D5B] rounded-lg shadow-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm text-[#1F4834]">
                {mode === 'login' ? 'Acceso Seguro' : 'Protección Total'}
              </span>
            </div>
            <ul className="text-xs text-[#3E6A56] font-semibold space-y-1.5 pl-1">
              {mode === 'login' ? (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B] flex-shrink-0" />
                    Encriptación de extremo a extremo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B] flex-shrink-0" />
                    Sincronización automática y segura
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B] flex-shrink-0" />
                    Datos protegidos con encriptación
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B] flex-shrink-0" />
                    Acceso multiplataforma
                  </li>
                </>
              )}
            </ul>
          </div>

          {mode === 'signup' && (
            <p className="text-xs text-[#B7AB9C] text-center mt-4 leading-relaxed">
              Al crear una cuenta, aceptas nuestros{' '}
              <button
                type="button"
                onClick={() => navigate('/terms-and-conditions')}
                className="text-[#E2610F] hover:underline font-bold"
              >
                Términos y Condiciones
              </button>
              {' '}y{' '}
              <button
                type="button"
                onClick={() => navigate('/privacy-policy')}
                className="text-[#E2610F] hover:underline font-bold"
              >
                Aviso de Privacidad
              </button>
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginScreen;