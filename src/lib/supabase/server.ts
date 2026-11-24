import { createAdminClient } from './server-admin'

// All server-side DB queries use the service role key (bypasses RLS)
export async function createClient() {
  return createAdminClient()
}
