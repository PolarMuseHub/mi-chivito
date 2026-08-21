import React, { useState } from 'react';
import { Menu, LogOut, User, Wallet, PlusCircle, TrendingUp, List, Shield, FileText, Trash2, Target, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { trackEvent, EVENTS } from '../utils/analytics';
import DeleteAccountModal from './DeleteAccountModal';

interface HeaderProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection = 'balance', onSectionChange }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      trackEvent(EVENTS.AUTH_SIGN_OUT);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar la cuenta');
      }

      await supabase.auth.signOut();

      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const navItems = [
    { id: 'balance', icon: Wallet, label: 'Balance Actual' },
    { id: 'nuevo', icon: PlusCircle, label: 'Nuevo Registro' },
    { id: 'metas', icon: Target, label: 'Mis Metas' },
    { id: 'analytics', icon: TrendingUp, label: 'Análisis Financiero' },
    { id: 'info', icon: List, label: 'Mi Información' },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/mi_chivito_web_banner.png"
                alt="Mi Chivito Logo"
                className="h-12 md:h-16 w-auto object-contain"
              />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange?.(item.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-orange-dark'
                        : 'text-gray-500 hover:text-orange-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                  aria-label="Menú de usuario"
                >
                  <User size={20} className="text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Conectado como:</p>
                      <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/terms-and-conditions');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Términos y Condiciones
                    </button>

                    <button
                      onClick={() => {
                        navigate('/privacy-policy');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Shield size={16} />
                      Aviso de Privacidad
                    </button>

                    <a
                      href="mailto:info@strategosops.com"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Contáctanos
                    </a>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar mi cuenta
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}

        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          userEmail={user?.email || ''}
        />
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                  isActive
                    ? 'text-orange-dark'
                    : 'text-gray-500 hover:text-orange-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium mt-1 leading-tight">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Header;