import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';

export const createClient = (cookieStore?: {
  getAll?: () => { name: string; value: string }[];
  setAll?: (cookies: { name: string; value: string; options?: unknown }[]) => void;
}) => {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          try {
            if (cookieStore?.setAll) {
              cookieStore.setAll(cookiesToSet);
            }
          } catch {
            // Ignored in client environments
          }
        },
      },
    }
  );
};
