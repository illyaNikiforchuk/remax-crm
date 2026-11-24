import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { PropertiesClient } from './PropertiesClient'

export default async function PropertiesPage() {
  const session = await getSession()
  const supabase = await createClient()

  const [propertiesRes, districtsRes, profilesRes] = await Promise.all([
    supabase
      .from('properties')
      .select('*, districts(id, name), profiles!author_id(id, full_name, email)')
      .order('created_at', { ascending: false }),
    supabase.from('districts').select('*').order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('status', 'active'),
  ])

  return (
    <PropertiesClient
      initialProperties={propertiesRes.data || []}
      districts={districtsRes.data || []}
      sellers={profilesRes.data || []}
      currentUserId={session?.id || ''}
      userRole={session?.role || 'seller'}
    />
  )
}
