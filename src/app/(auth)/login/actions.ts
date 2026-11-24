'use server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { signSession } from '@/lib/session'

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = (formData.get('password') as string || '').trim()

  if (!email || !password) return { error: 'Введіть email і пароль' }

  const db = createAdminClient()
  const { data: profile, error: dbError } = await db
    .from('profiles')
    .select('id, email, full_name, role, status, password_hash')
    .eq('email', email)
    .single()

  if (dbError || !profile || !profile.password_hash) {
    return { error: 'Невірний email або пароль' }
  }

  if (profile.status === 'disabled') {
    return { error: 'Аккаунт заблоковано' }
  }

  const ok = await bcrypt.compare(password, profile.password_hash)
  if (!ok) return { error: 'Невірний email або пароль' }

  const token = await signSession({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || '',
    role: profile.role as 'admin' | 'seller',
    status: profile.status as 'active' | 'disabled',
  })

  const cookieStore = await cookies()
  cookieStore.set('crm_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  redirect('/dashboard')
}
