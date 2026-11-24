import { createClient } from '@/lib/supabase/server'
import { PropertiesClient } from './PropertiesClient'

export default async function PropertiesPage() {
  const supabase = await createClient()

  const [propertiesRes, districtsRes, profilesRes, sessionRes] = await Promise.all([
    supabase
      .from('properties')
      .select('*, districts(id, name), profiles!author_id(id, full_name, email)')
      .order('created_at', { ascending: false }),
    supabase.from('districts').select('*').order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('status', 'active'),
    supabase.auth.getUser(),
  ])

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', sessionRes.data.user?.id || '')
    .single()

  return (
    <PropertiesClient
      initialProperties={propertiesRes.data || []}
      districts={districtsRes.data || []}
      sellers={profilesRes.data || []}
      currentUserId={sessionRes.data.user?.id || ''}
      userRole={profile?.role || 'seller'}
    />
  )
}
