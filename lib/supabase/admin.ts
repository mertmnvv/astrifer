import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Service-role client: bypasses RLS entirely. Only import this from trusted
 * server code (route handlers, server actions, the print worker) — never
 * from a Client Component, and never use it to hand a long-lived URL for
 * the private `starmaps-print` bucket back to the browser. Mint short-lived
 * signed URLs on demand instead.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
