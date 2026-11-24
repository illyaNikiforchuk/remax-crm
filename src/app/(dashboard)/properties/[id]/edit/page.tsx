import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { notFound, redirect } from 'next/navigation'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [propertyRes, districtsRes, sessionRes] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('districts').select('*').order('name'),
    supabase.auth.getUser(),
  ])

  if (!propertyRes.data) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', sessionRes.data.user?.id || '')
    .single()

  const canEdit = profile?.role === 'admin' || propertyRes.data.author_id === sessionRes.data.user?.id
  if (!canEdit) redirect('/properties')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Редактировать объект</h1>
      <PropertyForm districts={districtsRes.data || []} property={propertyRes.data} mode="edit" />
    </div>
  )
}
