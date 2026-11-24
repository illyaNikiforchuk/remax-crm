import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, full_name, phone, role, password } = await request.json()

  if (!email || !full_name || !password) {
    return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 })
  }

  // Use service role key for admin operations
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: role || 'seller' },
  })

  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 })

  await adminClient.from('profiles').update({
    full_name,
    phone: phone || null,
    role: role || 'seller',
    created_by: user.id,
  }).eq('id', newUser.user.id)

  const { data: createdProfile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', newUser.user.id)
    .single()

  return NextResponse.json({ profile: createdProfile })
}
