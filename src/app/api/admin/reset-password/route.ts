import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, newPassword } = await request.json()

  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Пароль повинен бути не менше 6 символів' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(newPassword, 10)
  const db = createAdminClient()
  const { error } = await db.from('profiles').update({ password_hash }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
