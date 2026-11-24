import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/properties/PropertyForm'

export default async function NewPropertyPage() {
  const supabase = await createClient()
  const { data: districts } = await supabase.from('districts').select('*').order('name')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Добавить объект</h1>
      <PropertyForm districts={districts || []} mode="create" />
    </div>
  )
}
