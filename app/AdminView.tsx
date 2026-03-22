'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  X, Save, Trash2, Shield, Users, Plus, UserPlus,
  Dumbbell, ChevronRight, Search, Check, ArrowLeft,
  Clock, RotateCcw, Hash, ChevronUp, ChevronDown, UserX, Calendar, Crown
} from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrjenrtnojmhianqzxlo.supabase.co'
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyamVucnRub2ptaGlhbnF6eGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU4MTYxOCwiZXhwIjoyMDg2MTU3NjE4fQ.GME1KUAeu-Z1ndUpNsQ9OFr0AnW0tcmGGU19eQG9d4U'

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile = {
  id: string; full_name: string; weight: string; height: string
  age: number; gender: string; role: string; experience_level: string
  training_days: number; injuries: string; diet_style: string; focus_areas: string[]
  email?: string; created_at?: string; plan?: string; membership_end?: string; coach_id?: string
}
type Meal = { name: string; protein: string[]; carbs: string[]; fat: string[] }
type RoutineEx = { id: number; exercise_id: string; name: string; sets: number; reps: string; rest_time: number; order: number }
type Routine   = { id: string; name: string; exercises: RoutineEx[] }

const MEAL_NAMES    = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud']

// ── Styles ────────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
}
const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, color: '#fff', outline: 'none', width: '100%', padding: '11px 14px', fontSize: 14
}
const lbl: React.CSSProperties = {
  fontSize: 10, color: '#6B7895', textTransform: 'uppercase',
  fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6, display: 'block'
}
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg,#00E5A8,#00C2FF)',
  boxShadow: '0 8px 24px rgba(0,229,168,0.4)', borderRadius: 20,
  padding: '14px 0', fontWeight: 900, fontSize: 13, color: '#fff',
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminView({ supabase, currentUserId, currentUserRole }: { supabase: any; currentUserId: string; currentUserRole: string }) {
  const isAdmin = currentUserRole === 'admin'
  const isCoach = currentUserRole === 'coach'
  const [users, setUsers]               = useState<Profile[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab]       = useState<'profile'|'nutrition'|'routines'|'notas'>('profile')
  const [meals, setMeals]               = useState<Meal[]>([])
  const [routines, setRoutines]         = useState<Routine[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [editProfile, setEditProfile]   = useState<Partial<Profile>>({})
  const [saving, setSaving]             = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')

  // Create user
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser]       = useState({ full_name: '', email: '', password: '', role: 'user' })
  const [creating, setCreating]     = useState(false)

  // Routine management
  const [newRoutineName, setNewRoutineName] = useState('')
  const [exSearch, setExSearch]             = useState('')
  const [exResults, setExResults]           = useState<any[]>([])
  const [selectedEx, setSelectedEx]         = useState<any | null>(null)
  const [exConfig, setExConfig]             = useState({ sets: 3, reps: '10', rest_time: 60 })
  const [addingEx, setAddingEx]             = useState(false)
  const [showCreateEx, setShowCreateEx]     = useState(false)
  const [newEx, setNewEx]                   = useState({ name: '', target: '' })
  const [creatingEx, setCreatingEx]         = useState(false)
  const searchRef                           = useRef<HTMLInputElement>(null)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toast = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 3000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }
  }

  // ── Users ────────────────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Profile[]>([])

  const loadUsers = async () => {
    let q = db.from('profiles').select('*')
    if (isCoach) q = q.eq('coach_id', currentUserId).eq('role', 'user')
    const { data } = await q
    setUsers(data || [])
    setLoading(false)
  }

  const loadCoaches = async () => {
    const { data } = await db.from('profiles').select('*').eq('role', 'coach')
    setCoaches(data || [])
  }

  useEffect(() => {
    loadUsers()
    if (isAdmin) loadCoaches()
  }, [])

  const deleteUser = async (user: Profile) => {
    if (isCoach && user.coach_id !== currentUserId) return toast('Sin permiso para eliminar este usuario', true)
    if (!confirm(`¿Eliminar a ${user.full_name}? Esta acción no se puede deshacer.`)) return
    try {
      await db.from('routine_exercises').delete().in('routine_id',
        (await db.from('routines').select('id').eq('user_id', user.id)).data?.map((r: any) => r.id) || []
      )
      await db.from('routines').delete().eq('user_id', user.id)
      await db.from('nutrition_plans').delete().eq('user_id', user.id)
      await db.from('profiles').delete().eq('id', user.id)
      await db.auth.admin.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setSelectedUser(null)
      toast(`${user.full_name} eliminado`)
    } catch (e: any) { toast(e.message || 'Error al eliminar usuario', true) }
  }

  const selectUser = async (user: Profile) => {
    setSelectedUser(user)
    setEditProfile(user)
    openMembership(user)
    setActiveTab('profile')
    setSelectedRoutine(null)
    const { data: nut } = await db.from('nutrition_plans').select('*').eq('user_id', user.id).single()
    setMeals(nut?.meals || MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })))
    await loadRoutines(user.id)
  }

  // ── Routines ─────────────────────────────────────────────────────────────
  const loadRoutines = async (userId: string) => {
    const { data } = await db.from('routines').select('id, name').eq('user_id', userId).order('name')
    setRoutines((data || []).map((r: any) => ({ ...r, exercises: [] })))
  }

  const loadRoutineExercises = async (routineId: string): Promise<RoutineEx[]> => {
    const { data: rows } = await db
      .from('routine_exercises')
      .select('id, sets, reps, rest_time, exercise_id, order')
      .eq('routine_id', routineId)
      .order('order', { ascending: true })
    if (!rows?.length) return []

    const ids = rows.map((r: any) => r.exercise_id).filter(Boolean)
    const nameMap: Record<string, string> = {}

    if (ids.length) {
      const { data: customEx } = await db.from('custom_exercises').select('id, name').in('id', ids)
      ;(customEx || []).forEach((e: any) => { nameMap[e.id] = e.name })
    }

    return rows.map((re: any) => ({
      id: re.id,
      exercise_id: re.exercise_id,
      name: nameMap[re.exercise_id] || 'Ejercicio',
      sets: re.sets || 3,
      reps: re.reps || '10',
      rest_time: re.rest_time || 60,
      order: re.order ?? 0,
    }))
  }

  const openRoutine = async (routine: Routine) => {
    const exercises = await loadRoutineExercises(routine.id)
    const full = { ...routine, exercises }
    setSelectedRoutine(full)
    setRoutines(prev => prev.map(r => r.id === routine.id ? full : r))
    setExSearch(''); setExResults([]); setSelectedEx(null)
    setExConfig({ sets: 3, reps: '10', rest_time: 60 })
  }

  const refreshSelectedRoutine = async () => {
    if (!selectedRoutine) return
    const exercises = await loadRoutineExercises(selectedRoutine.id)
    setSelectedRoutine(prev => prev ? { ...prev, exercises } : null)
  }

  const createRoutine = async () => {
    if (!newRoutineName.trim() || !selectedUser) return
    const { data, error } = await db.from('routines').insert([{ user_id: selectedUser.id, name: newRoutineName.trim() }]).select().single()
    if (error) return toast('Error al crear rutina', true)
    setNewRoutineName('')
    const newR: Routine = { id: data.id, name: data.name, exercises: [] }
    setRoutines(prev => [...prev, newR])
    toast('Rutina creada')
    openRoutine(newR)
  }

  const deleteRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return
    await db.from('routine_exercises').delete().eq('routine_id', id)
    await db.from('routines').delete().eq('id', id)
    setRoutines(prev => prev.filter(r => r.id !== id))
    if (selectedRoutine?.id === id) setSelectedRoutine(null)
    toast('Rutina eliminada')
  }

  // ── Exercise search ───────────────────────────────────────────────────────
  const searchExercises = async (q: string) => {
    setExSearch(q)
    setSelectedEx(null)
    if (q.trim().length < 2) { setExResults([]); return }
    const { data } = await db.from('custom_exercises').select('id, name, target').ilike('name', `%${q.trim()}%`).limit(10)
    setExResults(data || [])
  }

  const pickExercise = (ex: any) => {
    setSelectedEx(ex)
    setExSearch(ex.name)
    setExResults([])
  }

  const createCustomExercise = async () => {
    if (!newEx.name.trim()) return toast('Escribe un nombre', true)
    setCreatingEx(true)
    const { data, error } = await db.from('custom_exercises')
      .insert([{ name: newEx.name.trim(), target: newEx.target.trim() || 'General' }])
      .select().single()
    if (error) { toast('Error al crear ejercicio', true); setCreatingEx(false); return }
    toast(`"${data.name}" creado`)
    setNewEx({ name: '', target: '' })
    setShowCreateEx(false)
    // Auto-seleccionar el ejercicio recién creado
    pickExercise({ id: data.id, name: data.name, target: data.target })
    setCreatingEx(false)
  }

  const addExerciseToRoutine = async () => {
    if (!selectedRoutine || !selectedEx) return
    setAddingEx(true)
    const maxOrder = selectedRoutine.exercises.reduce((m, e) => Math.max(m, e.order ?? 0), 0)
    const { error } = await db.from('routine_exercises').insert([{
      routine_id: selectedRoutine.id,
      exercise_id: selectedEx.id,
      sets: exConfig.sets,
      reps: String(exConfig.reps),
      rest_time: exConfig.rest_time,
      order: maxOrder + 1,
    }])
    if (error) toast(error.message || 'Error al añadir ejercicio', true)
    else {
      toast(`${selectedEx.name} añadido`)
      setExSearch(''); setSelectedEx(null); setExResults([])
      setExConfig({ sets: 3, reps: '10', rest_time: 60 })
      await refreshSelectedRoutine()
    }
    setAddingEx(false)
  }

  // ── Exercise reorder ─────────────────────────────────────────────────────
  const moveExercise = async (idx: number, dir: -1 | 1) => {
    if (!selectedRoutine) return
    const exs = [...selectedRoutine.exercises]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= exs.length) return

    const a = { ...exs[idx], order: exs[swapIdx].order }
    const b = { ...exs[swapIdx], order: exs[idx].order }
    exs[idx] = a; exs[swapIdx] = b
    exs.sort((x, y) => x.order - y.order)
    setSelectedRoutine(prev => prev ? { ...prev, exercises: exs } : null)

    await Promise.all([
      db.from('routine_exercises').update({ order: a.order }).eq('id', a.id),
      db.from('routine_exercises').update({ order: b.order }).eq('id', b.id),
    ])
  }

  // ── Exercise edit (inline, saved on blur) ────────────────────────────────
  const updateLocalEx = (exId: number, field: string, value: any) => {
    setSelectedRoutine(prev => {
      if (!prev) return prev
      return { ...prev, exercises: prev.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e) }
    })
  }

  const saveExercise = async (ex: RoutineEx) => {
    await db.from('routine_exercises').update({ sets: ex.sets, reps: ex.reps, rest_time: ex.rest_time }).eq('id', ex.id)
  }

  const deleteExercise = async (exId: number) => {
    await db.from('routine_exercises').delete().eq('id', exId)
    setSelectedRoutine(prev => prev ? { ...prev, exercises: prev.exercises.filter(e => e.id !== exId) } : null)
    toast('Ejercicio eliminado')
  }

  // ── Membership ────────────────────────────────────────────────────────────
  const [membership, setMembership] = useState({ plan: 'Básico', membership_end: '' })

  const openMembership = (user: Profile) => {
    setMembership({ plan: user.plan || 'Básico', membership_end: user.membership_end || '' })
  }

  const extendMembership = (months: number) => {
    const base = membership.membership_end && new Date(membership.membership_end) > new Date()
      ? new Date(membership.membership_end)
      : new Date()
    base.setMonth(base.getMonth() + months)
    setMembership(p => ({ ...p, membership_end: base.toISOString().split('T')[0] }))
  }

  const saveMembership = async () => {
    if (!selectedUser) return
    const { error } = await db.from('profiles').update({
      plan: membership.plan,
      membership_end: membership.membership_end || null,
    }).eq('id', selectedUser.id)
    if (error) return toast(error.message || 'Error al guardar membresía', true)
    setSelectedUser(prev => prev ? { ...prev, plan: membership.plan, membership_end: membership.membership_end } : null)
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, plan: membership.plan, membership_end: membership.membership_end } : u))
    toast('Membresía actualizada')
  }

  const daysLeft = (end?: string) => {
    if (!end) return null
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
    return diff
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { error } = await db.from('profiles').update({
      full_name: editProfile.full_name, weight: editProfile.weight, height: editProfile.height,
      age: editProfile.age, gender: editProfile.gender, experience_level: editProfile.experience_level,
      training_days: editProfile.training_days, injuries: editProfile.injuries,
      diet_style: editProfile.diet_style, focus_areas: editProfile.focus_areas,
    }).eq('id', selectedUser.id)
    setSaving(false)
    error ? toast(error.message, true) : toast('Perfil guardado')
  }

  // ── Nutrition ─────────────────────────────────────────────────────────────
  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { data: ex } = await db.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).single()
    if (ex) await db.from('nutrition_plans').update({ meals }).eq('user_id', selectedUser.id)
    else    await db.from('nutrition_plans').insert([{ user_id: selectedUser.id, meals }])
    setSaving(false); toast('Nutrición guardada')
  }
  const updateMeal = (i: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setMeals(prev => prev.map((m, j) => j === i ? { ...m, [type]: val.split('\n').filter(Boolean) } : m))

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: '#6B7895' }}>Cargando...</p>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTINE DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedUser && activeTab === 'routines' && selectedRoutine) {
    return (
      <div className="space-y-4 pb-28">
        <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedRoutine(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>{selectedUser.full_name}</p>
            <h2 className="text-lg font-black text-white break-words">{selectedRoutine.name}</h2>
          </div>
          <button onClick={() => deleteRoutine(selectedRoutine.id)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={16} style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Toasts */}
        {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
        {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

        {/* ── AÑADIR EJERCICIO ── */}
        <div className="p-4 space-y-3 rounded-[20px]" style={{ background:'rgba(0,229,168,0.04)', border:'1px solid rgba(0,229,168,0.2)' }}>
          <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#00E5A8' }}>Añadir ejercicio</p>

          {/* Search */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3" style={{ ...inp, display:'flex', padding:'0 12px' }}>
              <Search size={14} style={{ color:'#6B7895', flexShrink:0 }} />
              <input
                ref={searchRef}
                className="flex-1 bg-transparent outline-none py-3 text-sm text-white placeholder:text-slate-600"
                placeholder="Buscar ejercicio por nombre..."
                value={exSearch}
                onChange={e => searchExercises(e.target.value)}
              />
              {exSearch && <button onClick={() => { setExSearch(''); setExResults([]); setSelectedEx(null) }}><X size={14} style={{ color:'#6B7895' }} /></button>}
            </div>
            {exResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-2xl overflow-hidden"
                style={{ background:'#0f1a2e', border:'1px solid rgba(0,229,168,0.25)', boxShadow:'0 12px 40px rgba(0,0,0,0.7)', maxHeight:260, overflowY:'auto' }}>
                {exResults.map((ex: any) => (
                  <button key={ex.id} onClick={() => pickExercise(ex)}
                    className="w-full text-left px-4 py-3 transition-all"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background='rgba(0,229,168,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                    <p className="text-sm font-bold text-white">{ex.name}</p>
                    <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{ex.target || 'General'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón crear ejercicio / formulario */}
          {!selectedEx && (
            <div>
              {!showCreateEx ? (
                <button onClick={() => setShowCreateEx(true)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(0,229,168,0.3)', color:'#00E5A8' }}>
                  <Plus size={13} /> Crear ejercicio nuevo
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl" style={{ background:'rgba(0,229,168,0.06)', border:'1px solid rgba(0,229,168,0.2)' }}>
                  <p className="text-[9px] uppercase font-black tracking-wider" style={{ color:'#00E5A8' }}>Nuevo ejercicio</p>
                  <input
                    style={{ ...inp, fontSize:13 } as React.CSSProperties}
                    placeholder="Nombre del ejercicio *"
                    value={newEx.name}
                    onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && createCustomExercise()}
                  />
                  <input
                    style={{ ...inp, fontSize:13 } as React.CSSProperties}
                    placeholder="Músculo / grupo (ej: Pecho, Pierna...)"
                    value={newEx.target}
                    onChange={e => setNewEx(p => ({ ...p, target: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowCreateEx(false); setNewEx({ name:'', target:'' }) }}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                      Cancelar
                    </button>
                    <button onClick={createCustomExercise} disabled={creatingEx}
                      className="flex-1 py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 transition-all active:scale-95"
                      style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', opacity: creatingEx ? 0.6 : 1 }}>
                      <Check size={13} /> {creatingEx ? 'Creando...' : 'Crear'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Config: only show when exercise selected */}
          {selectedEx && (
            <div className="space-y-3 animate-in fade-in" style={{ animation:'fadeUp 0.2s ease-out both' }}>
              {/* Selected exercise badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.2)' }}>
                <Dumbbell size={13} style={{ color:'#00E5A8', flexShrink:0 }} />
                <p className="text-sm font-bold text-white flex-1 break-words">{selectedEx.name}</p>
                <button onClick={() => { setSelectedEx(null); setExSearch('') }}><X size={13} style={{ color:'#6B7895' }} /></button>
              </div>

              {/* Sets / Reps / Rest */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Series',   icon:<Hash size={11}/>,  field:'sets',     type:'number', unit:'' },
                  { label:'Reps',     icon:<RotateCcw size={11}/>, field:'reps', type:'text',   unit:'' },
                  { label:'Desc.(s)', icon:<Clock size={11}/>, field:'rest_time', type:'number', unit:'s' },
                ].map(({ label, icon, field, type }) => (
                  <div key={field}>
                    <label style={{ ...lbl, marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>{icon}{label}</label>
                    <input
                      type={type} inputMode={type === 'number' ? 'numeric' : 'text'}
                      className="text-center font-black text-base"
                      style={{ ...inp, padding:'10px 4px', color:'#00E5A8', border:'1px solid rgba(0,229,168,0.35)' } as React.CSSProperties}
                      value={(exConfig as any)[field]}
                      onChange={e => setExConfig(p => ({ ...p, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <button onClick={addExerciseToRoutine} disabled={addingEx}
                className="w-full py-3 rounded-xl font-black uppercase text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', opacity: addingEx ? 0.6 : 1, boxShadow:'0 6px 20px rgba(0,229,168,0.35)' }}>
                <Plus size={16} /> {addingEx ? 'Añadiendo...' : 'Añadir a la rutina'}
              </button>
            </div>
          )}
        </div>

        {/* ── LISTA DE EJERCICIOS ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#6B7895' }}>
              Ejercicios · {selectedRoutine.exercises.length}
            </p>
          </div>

          {selectedRoutine.exercises.length === 0 && (
            <div className="text-center py-12 rounded-[20px]" style={card}>
              <Dumbbell size={36} className="mx-auto mb-3 opacity-20" style={{ color:'#6B7895' }} />
              <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin ejercicios</p>
              <p className="text-xs mt-1" style={{ color:'#6B7895' }}>Busca y añade ejercicios arriba</p>
            </div>
          )}

          {selectedRoutine.exercises.map((ex, idx) => (
            <div key={ex.id} className="rounded-[20px] overflow-hidden"
              style={{ ...card, animation:`fadeUp 0.3s ease-out ${idx * 0.04}s both` } as React.CSSProperties}>

              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                    style={{ background:'rgba(0,229,168,0.12)', color:'#00E5A8' }}>
                    {idx + 1}
                  </div>
                  <p className="font-black text-sm text-white break-words">{ex.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === 0 ? 0.25 : 1 }}>
                    <ChevronUp size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => moveExercise(idx, 1)} disabled={idx === selectedRoutine.exercises.length - 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity: idx === selectedRoutine.exercises.length - 1 ? 0.25 : 1 }}>
                    <ChevronDown size={14} style={{ color:'#A8B3CF' }} />
                  </button>
                  <button onClick={() => deleteExercise(ex.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                    <Trash2 size={13} style={{ color:'#ef4444' }} />
                  </button>
                </div>
              </div>

              {/* Inline editable fields */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                {[
                  { label:'Series',   icon:<Hash size={10}/>,       field:'sets',      type:'number' },
                  { label:'Reps',     icon:<RotateCcw size={10}/>,  field:'reps',      type:'text'   },
                  { label:'Desc.(s)', icon:<Clock size={10}/>,      field:'rest_time', type:'number' },
                ].map(({ label, icon, field, type }) => (
                  <div key={field}>
                    <label style={{ ...lbl, marginBottom:4, display:'flex', alignItems:'center', gap:3 }}>{icon}{label}</label>
                    <input
                      type={type} inputMode={type === 'number' ? 'numeric' : 'text'}
                      className="text-center font-black text-base"
                      style={{ ...inp, padding:'10px 4px', color:'#fff', border:'1px solid rgba(255,255,255,0.1)' } as React.CSSProperties}
                      value={(ex as any)[field] ?? ''}
                      onChange={e => updateLocalEx(ex.id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
                      onBlur={() => saveExercise(ex)}
                    />
                  </div>
                ))}
              </div>

              {/* Save hint */}
              <p className="text-center text-[9px] pb-2" style={{ color:'rgba(107,120,149,0.6)' }}>
                Se guarda automáticamente al salir del campo
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USER DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedUser) {
    const TABS = [
      { key: 'profile',   label: 'Perfil'    },
      { key: 'nutrition', label: 'Nutrición' },
      { key: 'routines',  label: 'Rutinas'   },
      { key: 'notas',     label: 'Notas'     },
    ] as const

    return (
      <div className="space-y-5 pb-28">
        <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedUser(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} style={{ color:'#A8B3CF' }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black uppercase text-white break-words">{selectedUser.full_name}</h1>
            <p className="text-[10px] uppercase font-bold" style={{ color: selectedUser.role === 'admin' ? '#00E5A8' : '#6B7895' }}>
              {selectedUser.role} · {selectedUser.email || ''}
            </p>
            {selectedUser.created_at && (
              <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color:'#6B7895' }}>
                <Calendar size={10} />
                Inscrito el {new Date(selectedUser.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' })}
              </p>
            )}
          </div>
          <button onClick={() => deleteUser(selectedUser)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95 shrink-0"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}
            title="Eliminar usuario">
            <UserX size={16} style={{ color:'#ef4444' }} />
          </button>
        </div>

        {/* Toasts */}
        {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
        {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
              style={activeTab === key
                ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff', boxShadow:'0 4px 16px rgba(0,229,168,0.35)' }
                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', color:'#6B7895' }
              }>{label}</button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Fecha de inscripción */}
            {selectedUser.created_at && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-[16px]"
                style={{ background:'rgba(124,92,255,0.08)', border:'1px solid rgba(124,92,255,0.2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(124,92,255,0.15)' }}>
                  <Calendar size={15} style={{ color:'#7C5CFF' }} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest" style={{ color:'#7C5CFF' }}>Fecha de inscripción</p>
                  <p className="text-sm font-black text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                  </p>
                  <p className="text-[10px]" style={{ color:'#6B7895' }}>
                    Hace {Math.floor((Date.now() - new Date(selectedUser.created_at).getTime()) / 86400000)} días
                  </p>
                </div>
              </div>
            )}
            {/* ── MEMBRESÍA (coach no puede editar membresía de otros coaches, solo de sus alumnos) ── */}
            {(isAdmin || (isCoach && selectedUser.role === 'user')) && (() => {
              const days = daysLeft(membership.membership_end)
              const isExpired = days !== null && days <= 0
              const isWarning = days !== null && days > 0 && days <= 7
              const isActive  = days !== null && days > 7
              const statusColor = isActive ? '#00E5A8' : isWarning ? '#F59E0B' : '#ef4444'
              const statusBg    = isActive ? 'rgba(0,229,168,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
              const statusBorder= isActive ? 'rgba(0,229,168,0.2)'  : isWarning ? 'rgba(245,158,11,0.2)'  : 'rgba(239,68,68,0.2)'
              return (
                <div className="p-4 space-y-4 rounded-[20px]"
                  style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown size={16} style={{ color: statusColor }} />
                      <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: statusColor }}>Membresía</p>
                    </div>
                    <div className="px-3 py-1 rounded-xl text-[10px] font-black uppercase"
                      style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                      {days === null ? 'Sin fecha' : isExpired ? 'Caducada' : isWarning ? `⚠ ${days}d restantes` : `✓ ${days}d restantes`}
                    </div>
                  </div>

                  {/* Plan selector */}
                  <div>
                    <label style={lbl}>Plan</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Básico','Premium','VIP','Élite'].map(p => (
                        <button key={p} type="button"
                          onClick={() => setMembership(prev => ({ ...prev, plan: p }))}
                          className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={membership.plan === p
                            ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                            : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha fin */}
                  <div>
                    <label style={lbl}>Fecha de vencimiento</label>
                    <input
                      type="date"
                      style={{ ...inp, colorScheme: 'dark' } as React.CSSProperties}
                      value={membership.membership_end}
                      onChange={e => setMembership(p => ({ ...p, membership_end: e.target.value }))}
                    />
                  </div>

                  {/* Botones rápidos */}
                  <div>
                    <label style={lbl}>Extender acceso</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[{ label:'+1m', months:1 },{ label:'+3m', months:3 },{ label:'+6m', months:6 },{ label:'+1a', months:12 }].map(({ label, months }) => (
                        <button key={label} type="button" onClick={() => extendMembership(months)}
                          className="py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#A8B3CF' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Revocar / Guardar */}
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setMembership(p => ({ ...p, membership_end: new Date(Date.now() - 86400000).toISOString().split('T')[0] }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>
                      Revocar acceso
                    </button>
                    <button type="button" onClick={saveMembership}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase text-white transition-all active:scale-95 flex items-center justify-center gap-1"
                      style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                      <Save size={13} /> Guardar
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── ASIGNAR COACH (solo admin, solo para usuarios tipo user) ── */}
            {isAdmin && selectedUser.role === 'user' && (
              <div className="p-4 space-y-3 rounded-[20px]"
                style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color:'#F59E0B' }} />
                  <p className="text-[10px] uppercase font-black tracking-widest" style={{ color:'#F59E0B' }}>Coach asignado</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button"
                    onClick={async () => {
                      await db.from('profiles').update({ coach_id: null }).eq('id', selectedUser.id)
                      setSelectedUser(prev => prev ? { ...prev, coach_id: undefined } : null)
                      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, coach_id: undefined } : u))
                      toast('Coach desasignado')
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                    style={!selectedUser.coach_id
                      ? { background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff' }
                      : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                    Sin coach
                  </button>
                  {coaches.map(coach => (
                    <button key={coach.id} type="button"
                      onClick={async () => {
                        await db.from('profiles').update({ coach_id: coach.id }).eq('id', selectedUser.id)
                        setSelectedUser(prev => prev ? { ...prev, coach_id: coach.id } : null)
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, coach_id: coach.id } : u))
                        toast(`Asignado a ${coach.full_name}`)
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={selectedUser.coach_id === coach.id
                        ? { background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff' }
                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                      {coach.full_name}
                    </button>
                  ))}
                  {coaches.length === 0 && (
                    <p className="text-xs" style={{ color:'#6B7895' }}>No hay coaches creados aún</p>
                  )}
                </div>
              </div>
            )}

            <div className="p-5 space-y-4" style={card}>
              <div>
                <label style={lbl}>Nombre completo</label>
                <input style={inp} value={editProfile.full_name || ''} onChange={e => setEditProfile(p => ({...p, full_name: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Peso (kg)',    field:'weight',        type:'number' },
                  { label:'Altura (m)',   field:'height',        type:'number' },
                  { label:'Edad',         field:'age',           type:'number' },
                  { label:'Días entreno', field:'training_days', type:'number' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label style={lbl}>{label}</label>
                    <input type={type} style={inp} value={(editProfile as any)[field] || ''}
                      onChange={e => setEditProfile(p => ({...p, [field]: e.target.value}))} />
                  </div>
                ))}
                <div>
                  <label style={lbl}>Género</label>
                  <select style={inp} value={editProfile.gender || ''} onChange={e => setEditProfile(p => ({...p, gender: e.target.value}))}>
                    <option value="Hombre">Hombre</option><option value="Mujer">Mujer</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Nivel</label>
                  <select style={inp} value={editProfile.experience_level || ''} onChange={e => setEditProfile(p => ({...p, experience_level: e.target.value}))}>
                    <option value="">—</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                {isAdmin && (
                  <div>
                    <label style={lbl}>Rol</label>
                    <select style={inp} value={editProfile.role || 'user'} onChange={e => setEditProfile(p => ({...p, role: e.target.value}))}>
                      <option value="user">user</option>
                      <option value="coach">coach</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Áreas de enfoque</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map(opt => {
                    const on = (editProfile.focus_areas || []).includes(opt)
                    return (
                      <button key={opt} type="button"
                        onClick={() => { const cur = editProfile.focus_areas||[]; setEditProfile(p => ({...p, focus_areas: cur.includes(opt)?cur.filter(f=>f!==opt):[...cur,opt]})) }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={on ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                                  : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        )}

        {/* ── TAB: NUTRITION ── */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            {meals.map((meal, i) => (
              <div key={i} style={card} className="overflow-hidden">
                <div className="px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,229,168,0.05)' }}>
                  <h2 className="font-black uppercase text-sm" style={{ color:'#00E5A8' }}>{meal.name}</h2>
                </div>
                <div className="p-5 space-y-4">
                  {(['protein','carbs','fat'] as const).map(type => (
                    <div key={type}>
                      <label style={lbl}>{type==='protein'?'🥩 Proteína':type==='carbs'?'🌾 Carbohidrato':'🥑 Grasa'} — una por línea</label>
                      <textarea className="resize-none" style={{...inp, height:80, fontSize:13, lineHeight:'1.6'} as React.CSSProperties}
                        value={meal[type].join('\n')} onChange={e => updateMeal(i, type, e.target.value)} placeholder="Ej: Pollo (100g)" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={saveNutrition} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Nutrición'}
            </button>
          </div>
        )}

        {/* ── TAB: ROUTINES ── */}
        {activeTab === 'routines' && (
          <div className="space-y-4">
            {/* Crear nueva rutina */}
            <div className="p-4 rounded-[20px]" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] uppercase font-black tracking-widest mb-3" style={{ color:'#6B7895' }}>Nueva rutina</p>
              <div className="flex gap-2">
                <input
                  style={{ ...inp, flex:1 } as React.CSSProperties}
                  placeholder="Ej: Día 1 — Pecho y Espalda"
                  value={newRoutineName}
                  onChange={e => setNewRoutineName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createRoutine()}
                />
                <button onClick={createRoutine}
                  className="px-4 rounded-xl font-black text-white transition-all active:scale-95 shrink-0 flex items-center gap-1"
                  style={{ background:'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow:'0 4px 16px rgba(0,229,168,0.3)' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Lista de rutinas */}
            {routines.length === 0 ? (
              <div className="text-center py-12 rounded-[20px]" style={card}>
                <Dumbbell size={36} className="mx-auto mb-3 opacity-20" style={{ color:'#6B7895' }} />
                <p className="text-sm font-bold uppercase" style={{ color:'#6B7895' }}>Sin rutinas asignadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black tracking-widest px-1" style={{ color:'#6B7895' }}>
                  Rutinas · {routines.length}
                </p>
                {routines.map((routine, idx) => (
                  <button key={routine.id} onClick={() => openRoutine(routine)}
                    className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
                    style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.06)', animation:`fadeUp 0.3s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.2)' }}>
                        <Dumbbell size={16} style={{ color:'#00E5A8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-white break-words">{routine.name}</p>
                        <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>
                          {routine.exercises?.length || 0} ejercicios · Toca para gestionar
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: NOTAS ── */}
        {activeTab === 'notas' && (
          <div className="space-y-4">
            <div className="p-5 space-y-4" style={card}>
              <div>
                <label style={lbl}>Estilo de dieta</label>
                <input style={inp} value={editProfile.diet_style || ''} onChange={e => setEditProfile(p => ({...p, diet_style: e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Notas / Lesiones</label>
                <textarea className="resize-none" style={{...inp, height:120} as React.CSSProperties}
                  value={editProfile.injuries || ''} onChange={e => setEditProfile(p => ({...p, injuries: e.target.value}))} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving?0.6:1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Notas'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // USER LIST
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 pb-28">
      <style>{`@keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color:'#6B7895' }}>Panel</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">{isCoach ? 'Mis Alumnos' : 'Administración'}</h1>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: isCoach ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'linear-gradient(135deg,#7C5CFF,#00C2FF)', boxShadow: isCoach ? '0 4px 20px rgba(245,158,11,0.35)' : '0 4px 20px rgba(124,92,255,0.35)' }}>
          {isCoach ? <Users size={22} className="text-white" /> : <Shield size={22} className="text-white" />}
        </div>
      </div>

      {/* Toasts */}
      {success && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>✓ {success}</div>}
      {error   && <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>✕ {error}</div>}

      {/* Stats + Crear */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-[20px] flex items-center gap-3" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(124,92,255,0.15)' }}>
            <Users size={18} style={{ color:'#7C5CFF' }} />
          </div>
          <div>
            <p className="text-2xl font-black text-white leading-none">{users.length}</p>
            <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>{isCoach ? 'Alumnos' : 'Usuarios'}</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="p-4 rounded-[20px] flex items-center gap-3 transition-all active:scale-[0.97]"
          style={{ background:'linear-gradient(135deg,rgba(0,229,168,0.15),rgba(0,194,255,0.1))', border:'1px solid rgba(0,229,168,0.25)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(0,229,168,0.15)' }}>
            <UserPlus size={18} style={{ color:'#00E5A8' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-white leading-none">Crear</p>
            <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#00E5A8' }}>Nuevo usuario</p>
          </div>
        </button>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {users.map((user, idx) => (
          <button key={user.id} onClick={() => selectUser(user)}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
            style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)', animation:`fadeUp 0.4s ease-out ${idx*0.05}s both` } as React.CSSProperties}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                style={user.role==='admin'
                  ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                  : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                {(user.full_name||'?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white truncate">{user.full_name}</p>
                <p className="text-[10px] uppercase font-bold mt-0.5 truncate" style={{ color:'#6B7895' }}>
                  {user.gender} · {user.age} años · {user.weight}kg
                  {' · '}<span style={{ color: user.role==='admin'?'#00E5A8':'#6B7895' }}>{user.role}</span>
                </p>
                {user.created_at && (
                  <p className="text-[9px] mt-0.5 flex items-center gap-1" style={{ color:'rgba(107,120,149,0.7)' }}>
                    <Calendar size={9} />
                    {new Date(user.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                )}
                {isAdmin && user.coach_id && (
                  <p className="text-[9px] mt-0.5 font-bold" style={{ color:'#F59E0B' }}>
                    Coach: {coaches.find(c => c.id === user.coach_id)?.full_name || '—'}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
          </button>
        ))}
      </div>

      {/* CREATE USER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center p-4 pb-8" style={{ background:'rgba(11,18,32,0.85)', backdropFilter:'blur(16px)' }}>
          <div className="w-full max-w-sm rounded-[24px] p-6 space-y-5"
            style={{ background:'rgba(18,26,42,0.98)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', animation:'fadeUp 0.35s ease-out both' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>Admin</p>
                <h2 className="text-lg font-black uppercase text-white">Nuevo Usuario</h2>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <X size={16} style={{ color:'#A8B3CF' }} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label:'Nombre completo', field:'full_name', type:'text',     placeholder:'Ej: Alejandro Gómez' },
                { label:'Email',           field:'email',     type:'email',    placeholder:'correo@ejemplo.com'  },
                { label:'Contraseña',      field:'password',  type:'password', placeholder:'Mínimo 6 caracteres' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label style={lbl}>{label}</label>
                  <input type={type} placeholder={placeholder} style={inp}
                    value={(newUser as any)[field]}
                    onChange={e => setNewUser(p => ({...p, [field]: e.target.value}))} />
                </div>
              ))}
              {isAdmin && (
                <div>
                  <label style={lbl}>Rol</label>
                  <div className="flex gap-2">
                    {['user','coach','admin'].map(r => (
                      <button key={r} type="button" onClick={() => setNewUser(p => ({...p, role: r}))}
                        className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                        style={newUser.role===r
                          ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                          : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={async () => {
              if (!newUser.email || !newUser.password || !newUser.full_name) return toast('Completa todos los campos', true)
              setCreating(true)
              try {
                const { data: authData, error: authError } = await db.auth.admin.createUser({ email: newUser.email, password: newUser.password, email_confirm: true })
                if (authError) throw new Error(authError.message)
                const profileData: any = { id: authData.user.id, full_name: newUser.full_name, role: isCoach ? 'user' : (newUser.role || 'user'), email: newUser.email }
                if (isCoach) profileData.coach_id = currentUserId
                const { error: profileError } = await db.from('profiles').upsert(profileData)
                if (profileError) throw new Error(profileError.message)
                // Garantizar coach_id aunque un trigger haya creado el perfil antes
                if (isCoach) {
                  await db.from('profiles').update({ coach_id: currentUserId }).eq('id', authData.user.id)
                }
                toast('Usuario creado correctamente')
                setShowCreate(false)
                setNewUser({ full_name: '', email: '', password: '', role: 'user' })
                loadUsers()
                if (isAdmin) loadCoaches()
              } catch (e: any) { toast(e.message || 'Error al crear usuario', true) }
              finally { setCreating(false) }
            }} disabled={creating} style={{ ...btnPrimary, opacity: creating?0.6:1 } as React.CSSProperties} className="transition-all active:scale-[0.97]">
              <UserPlus size={16} /> {creating ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
