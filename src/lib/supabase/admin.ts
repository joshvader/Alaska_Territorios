import { createClient as createBrowserClient } from '@supabase/supabase-js';

/**
 * Cliente administrativo de Supabase (service role).
 * SOLO debe usarse en el servidor (Server Actions / Route Handlers).
 * NUNCA importar en Client Components: bypassa las políticas de RLS.
 */
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
