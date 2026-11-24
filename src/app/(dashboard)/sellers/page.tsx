import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { SellersClient } from './SellersClient'

export default async function SellersPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()
  const { data: sellers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Продавцы</h1>
      <SellersClient sellers={sellers || []} />
    </div>
  )
}
