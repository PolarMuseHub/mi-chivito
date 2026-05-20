import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import LoginScreen from './LoginScreen';
import LoadingSpinner from './LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the reset password page
    if (window.location.pathname === '/reset-password') {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a recovery session (password reset)
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      
      if (type === 'recovery' && session?.user) {
        // This is a password reset session, redirect to reset password page
        window.location.href = '/reset-password' + window.location.search;
        return;
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Don't handle auth changes on reset password page
        if (window.location.pathname === '/reset-password') {
          return;
        }

        // Check if this is a recovery session
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        
        if (event === 'TOKEN_REFRESHED' && type === 'recovery' && session?.user) {
          // This is a password reset session, redirect to reset password page
          window.location.href = '/reset-password' + window.location.search;
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything on reset password page - let the router handle it
  if (window.location.pathname === '/reset-password') {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};

export default AuthWrapper;