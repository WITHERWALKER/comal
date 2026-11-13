import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient as createSsrClient } from "@/src/lib/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente privilegiado solo para operaciones de checkout en el servidor.
 * Si no hay service role, usa el cliente SSR con políticas RLS de invitado.
 */
export async function getCheckoutDatabase(): Promise<SupabaseClient> {
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const cookieStore = await cookies();
  return createSsrClient(cookieStore);
}
