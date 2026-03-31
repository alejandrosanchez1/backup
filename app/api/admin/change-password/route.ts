import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const { userId, password } = await req.json()

  if (!userId || !password || password.length < 6) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { data, error } = await adminClient.auth.admin.updateUserById(userId, { password })

  if (error) {
    console.error('[change-password] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.log('[change-password] OK for user:', data.user?.id)
  return NextResponse.json({ success: true })
}
