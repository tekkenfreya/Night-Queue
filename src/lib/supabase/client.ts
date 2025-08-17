import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // During build time, return a mock client
  if (typeof window === 'undefined' && (!url || url.includes('placeholder'))) {
    return null as any;
  }
  
  if (!url || !key) {
    throw new Error('Supabase URL and key must be provided. Please check your environment variables.');
  }
  
  return createBrowserClient(url, key, {
    auth: {
      persistSession: true, // Keep for production, but we'll control it manually
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-client-info': 'nightqueue-web'
      }
    }
  });
}