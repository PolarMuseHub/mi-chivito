import { supabase } from './supabase';

// Get or create anonymous ID
const getAnonymousId = (): string => {
  let anonymousId = localStorage.getItem('anonymous_id');
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem('anonymous_id', anonymousId);
  }
  return anonymousId;
};

// Track event
export const trackEvent = async (event: string, metadata: Record<string, any> = {}) => {
  // Analytics tracking disabled - usage_logs table not configured
  return;
};

// Event types
export const EVENTS = {
  APP_LOADED: 'app_loaded',
  TRANSACTION_ADDED: 'transaction_added',
  TRANSACTION_DELETED: 'transaction_deleted',
  DATA_EXPORTED: 'data_exported',
  CHART_TIMERANGE_CHANGED: 'chart_timerange_changed',
  CHART_TYPE_TOGGLED: 'chart_type_toggled',
  AUTH_SIGN_UP: 'auth_sign_up',
  AUTH_SIGN_IN: 'auth_sign_in',
  AUTH_SIGN_OUT: 'auth_sign_out',
  AUTH_SESSION_STARTED: 'auth_session_started'
} as const;