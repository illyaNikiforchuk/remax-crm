'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  return session
}

export async function createDistrictAction(name: string) {
  await requireAdmin()
  const db = createAdminClient()
  const { data, error } = await db.from('districts').insert({ name }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/settings/districts')
  return { data }
}

export async function updateDistrictAction(id: string, name: string) {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db.from('districts').update({ name }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings/districts')
  return {}
}

export async function deleteDistrictAction(id: string) {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db.from('districts').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings/districts')
  return {}
}
