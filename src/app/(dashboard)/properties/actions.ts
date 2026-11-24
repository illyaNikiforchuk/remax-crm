'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { getSession } from '@/lib/session'

export async function createPropertyAction(payload: Record<string, unknown>) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()
  const { data, error } = await db
    .from('properties')
    .insert({ ...payload, author_id: session.id })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/properties')
  return { id: data.id }
}

export async function updatePropertyAction(id: string, payload: Record<string, unknown>) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()

  // Check ownership
  const { data: prop } = await db.from('properties').select('author_id').eq('id', id).single()
  if (!prop) return { error: 'Объект не найден' }
  if (session.role !== 'admin' && prop.author_id !== session.id) return { error: 'Нет доступа' }

  const { error } = await db.from('properties').update(payload).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/properties')
  revalidatePath(`/properties/${id}`)
  return {}
}

export async function deletePropertyAction(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = createAdminClient()

  const { data: prop } = await db.from('properties').select('author_id').eq('id', id).single()
  if (!prop) return { error: 'Объект не найден' }
  if (session.role !== 'admin' && prop.author_id !== session.id) return { error: 'Нет доступа' }

  const { error } = await db.from('properties').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/properties')
  return {}
}
