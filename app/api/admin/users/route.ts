import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic';


const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await adminClient().from('profiles').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { email, password, full_name, role } = await req.json()
  if (!email || !password || !full_name)
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })

  const supabase = adminClient()

  // 1. Crear el usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // 2. Crear o actualizar el perfil
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    full_name,
    role: role || 'user',
    email,
  })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: authData.user.id })
}
