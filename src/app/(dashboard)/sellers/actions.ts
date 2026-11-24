'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')
  return session
}

export async function updateSellerStatusAction(sellerId: string, status: 'active' | 'disabled') {
  await requireAdmin()
  const db = createAdminClient()
  const { error } = await db.from('profiles').update({ status }).eq('id', sellerId)
  if (error) return { error: error.message }
  revalidatePath('/sellers')
  return {}
}

export async function createSellerAction(data: {
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'seller'
  password: string
}) {
  const admin = await requireAdmin()
  const db = createAdminClient()

  const existing = await db.from('profiles').select('id').eq('email', data.email).single()
  if (existing.data) return { error: 'Email вже зайнятий' }

  const password_hash = await bcrypt.hash(data.password, 10)

  // Create auth user first (required for profiles FK constraint)
  const { createClient } = await import('@supabase/supabase-js')
  const adminAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUser, error: authError } = await adminAuth.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name, role: data.role },
  })

  if (authError) return { error: authError.message }

  // Update the auto-created profile with password_hash and other fields
  await db.from('profiles').update({
    full_name: data.full_name,
    phone: data.phone || null,
    role: data.role,
    password_hash,
    created_by: admin.id,
  }).eq('id', authUser.user.id)

  revalidatePath('/sellers')
  return {}
}
