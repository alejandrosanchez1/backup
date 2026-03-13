import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const sb = admin()

  // 1. Rutinas del usuario
  const { data: routines, error: rErr } = await sb
    .from('routines').select('*').eq('user_id', userId)
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })
  if (!routines?.length) return NextResponse.json([])

  const routineIds = routines.map(r => r.id)

  // 2. Filas de routine_exercises (sin join para evitar problemas de RLS/relación)
  const { data: reRows, error: reErr } = await sb
    .from('routine_exercises')
    .select('id, routine_id, exercise_id, sets, reps, rest_time')
    .in('routine_id', routineIds)
  if (reErr) return NextResponse.json({ error: reErr.message }, { status: 500 })

  // 3. Nombres de ejercicios desde custom_exercises
  const exerciseIds = [...new Set((reRows || []).map(r => r.exercise_id).filter(Boolean))]
  let nameMap: Record<string, string> = {}

  if (exerciseIds.length > 0) {
    const { data: exData } = await sb
      .from('custom_exercises')
      .select('id, name')
      .in('id', exerciseIds)
    ;(exData || []).forEach(e => { nameMap[e.id] = e.name })
  }

  // 4. Combinar
  const result = routines.map(r => ({
    ...r,
    routine_exercises: (reRows || [])
      .filter(re => re.routine_id === r.id)
      .map(re => ({
        id:        re.id,
        name:      nameMap[re.exercise_id] || 'Ejercicio',
        sets:      re.sets,
        reps:      re.reps,
        rest_time: re.rest_time,
      }))
  }))

  return NextResponse.json(result)
}

export async function PATCH(req: Request) {
  const { exerciseId, sets, reps, rest_time } = await req.json()
  if (!exerciseId) return NextResponse.json({ error: 'exerciseId requerido' }, { status: 400 })
  const { error } = await admin().from('routine_exercises')
    .update({ sets, reps, rest_time }).eq('id', exerciseId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const exerciseId = searchParams.get('exerciseId')
  const routineId  = searchParams.get('routineId')
  const sb = admin()

  if (exerciseId) {
    const { error } = await sb.from('routine_exercises').delete().eq('id', exerciseId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }
  if (routineId) {
    await sb.from('routine_exercises').delete().eq('routine_id', routineId)
    const { error } = await sb.from('routines').delete().eq('id', routineId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Parámetro requerido' }, { status: 400 })
}

export async function POST(req: Request) {
  const { userId, name } = await req.json()
  if (!userId || !name) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  const { data, error } = await admin().from('routines')
    .insert([{ user_id: userId, name }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
