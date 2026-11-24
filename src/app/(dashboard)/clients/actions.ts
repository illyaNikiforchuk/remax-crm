'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { getSession } from '@/lib/session'

export async function createClientAction(payload: {
  full_name: string
  phone?: string
  email?: string
  budget_min?: number | null
  budget_max?: number | null
  assigned_to?: string | null
  status: string
  notes?: string
  property_types?: string[]
  district_ids?: string[]
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()
  const { error } = await db.from('clients').insert({
    ...payload,
    created_by: session.id,
    assigned_to: payload.assigned_to || session.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/clients')
  return {}
}

export async function updateClientAction(id: string, payload: Record<string, unknown>) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()
  const { error } = await db.from('clients').update(payload).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clients')
  return {}
}

export async function deleteClientAction(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()
  const { error } = await db.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clients')
  return {}
}
