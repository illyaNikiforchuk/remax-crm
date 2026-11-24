import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { notFound, redirect } from 'next/navigation'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const supabase = await createClient()

  const [propertyRes, districtsRes] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('districts').select('*').order('name'),
  ])

  if (!propertyRes.data) notFound()

  const canEdit = session?.role === 'admin' || propertyRes.data.author_id === session?.id
  if (!canEdit) redirect('/properties')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Редактировать объект</h1>
      <PropertyForm districts={districtsRes.data || []} property={propertyRes.data} mode="edit" />
    </div>
  )
}
