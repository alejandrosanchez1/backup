'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  User, ChevronRight, X, Save, Trash2, ChevronDown,
  Shield, Users, Plus, UserPlus, Dumbbell, Edit2, Check
} from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrjenrtnojmhianqzxlo.supabase.co'
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyamVucnRub2ptaGlhbnF6eGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU4MTYxOCwiZXhwIjoyMDg2MTU3NjE4fQ.GME1KUAeu-Z1ndUpNsQ9OFr0AnW0tcmGGU19eQG9d4U'

const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

type Profile = {
  id: string; full_name: string; weight: string; height: string
  age: number; gender: string; role: string; experience_level: string
  training_days: number; injuries: string; diet_style: string; focus_areas: string[]
  email?: string
}
type Meal = { name: string; protein: string[]; carbs: string[]; fat: string[] }
type RoutineEx = { id: number; name: string; sets: number; reps: string; rest_time: number }
type Routine = { id: string; name: string; routine_exercises: RoutineEx[] }

const MEAL_NAMES  = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud']

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
export default function AdminView({ supabase }: { supabase: any }) {
  const [users, setUsers]         = useState<Profile[]>([])
  const [loading, setLoading]     = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'profile'|'nutrition'|'routines'|'notas'>('profile')
  const [meals, setMeals]         = useState<Meal[]>([])
  const [routines, setRoutines]   = useState<Routine[]>([])
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({})
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  // Create user modal
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'user' })
  const [creating, setCreating] = useState(false)

  // Routine editing
  const [editingEx, setEditingEx] = useState<{[key: string]: RoutineEx}>({})
  const [newRoutineName, setNewRoutineName] = useState('')

  const loadUsers = async () => {
    const { data } = await adminSupabase.from('profiles').select('*')
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const selectUser = async (user: Profile) => {
    setSelectedUser(user); setEditProfile(user); setActiveTab('profile')
    const { data: nut } = await supabase.from('nutrition_plans').select('*').eq('user_id', user.id).single()
    setMeals(nut?.meals || MEAL_NAMES.map(n => ({ name: n, protein: [], carbs: [], fat: [] })))
    await loadRoutines(user.id)
  }

  const loadRoutines = async (userId: string) => {
    const { data, error } = await supabase
      .from('routines')
      .select('id, name, user_id')
      .eq('user_id', userId)
    if (error) { toast('Error cargando rutinas', true); return }
    setRoutines((data || []).map((r: any) => ({ ...r, routine_exercises: [] })))
  }

  const loadExercises = async (routineId: string) => {
    const { data: reRows } = await supabase
      .from('routine_exercises')
      .select('id, sets, reps, rest_time, exercise_id')
      .eq('routine_id', routineId)
    if (!reRows?.length) return []
    const ids = reRows.map((r: any) => r.exercise_id).filter(Boolean)
    let nameMap: Record<string, string> = {}
    if (ids.length) {
      const { data: exData } = await supabase
        .from('custom_exercises')
        .select('id, name')
        .in('id', ids)
      ;(exData || []).forEach((e: any) => { nameMap[e.id] = e.name })
    }
    return reRows.map((re: any) => ({
      id: re.id, sets: re.sets, reps: re.reps, rest_time: re.rest_time,
      name: nameMap[re.exercise_id] || 'Ejercicio',
    }))
  }

  const toast = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 3000) }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }
  }

  // ── Create user ────────────────────────────────────────────────────────────
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name)
      return toast('Completa todos los campos', true)
    setCreating(true)
    try {
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      })
      if (authError) throw new Error(authError.message)
      const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: newUser.full_name,
        role: newUser.role || 'user',
        email: newUser.email,
      })
      if (profileError) throw new Error(profileError.message)
      toast('Usuario creado correctamente')
      setShowCreate(false)
      setNewUser({ full_name: '', email: '', password: '', role: 'user' })
      loadUsers()
    } catch (e: any) {
      toast(e.message || 'Error al crear usuario', true)
    } finally {
      setCreating(false)
    }
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: editProfile.full_name, weight: editProfile.weight, height: editProfile.height,
      age: editProfile.age, gender: editProfile.gender, experience_level: editProfile.experience_level,
      training_days: editProfile.training_days, injuries: editProfile.injuries,
      diet_style: editProfile.diet_style, focus_areas: editProfile.focus_areas,
    }).eq('id', selectedUser.id)
    setSaving(false)
    error ? toast(error.message, true) : toast('Perfil guardado')
  }

  // ── Nutrition ──────────────────────────────────────────────────────────────
  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { data: ex } = await supabase.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).single()
    if (ex) await supabase.from('nutrition_plans').update({ meals }).eq('user_id', selectedUser.id)
    else await supabase.from('nutrition_plans').insert([{ user_id: selectedUser.id, meals }])
    setSaving(false); toast('Nutrición guardada')
  }

  const updateMeal = (i: number, type: 'protein'|'carbs'|'fat', val: string) =>
    setMeals(prev => prev.map((m, j) => j === i ? { ...m, [type]: val.split('\n').filter(Boolean) } : m))

  // ── Routines ───────────────────────────────────────────────────────────────
  const refreshRoutines = async () => {
    if (!selectedUser) return
    await loadRoutines(selectedUser.id)
  }

  const createRoutine = async () => {
    if (!newRoutineName.trim() || !selectedUser) return
    const { error } = await supabase.from('routines').insert([{ user_id: selectedUser.id, name: newRoutineName.trim() }])
    if (error) return toast('Error al crear rutina', true)
    setNewRoutineName('')
    refreshRoutines()
    toast('Rutina creada')
  }

  const deleteRoutine = async (id: string) => {
    if (!confirm('¿Eliminar esta rutina?')) return
    await supabase.from('routine_exercises').delete().eq('routine_id', id)
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (error) return toast('Error al eliminar', true)
    setRoutines(prev => prev.filter(r => r.id !== id))
    toast('Rutina eliminada')
  }

  const saveExercise = async (exId: number) => {
    const ex = editingEx[exId]
    if (!ex) return
    const { error } = await supabase.from('routine_exercises')
      .update({ sets: ex.sets, reps: ex.reps, rest_time: ex.rest_time })
      .eq('id', exId)
    if (error) return toast('Error al guardar', true)
    setEditingEx(prev => { const n = {...prev}; delete n[exId]; return n })
    if (expandedRoutine) {
      const exs = await loadExercises(expandedRoutine)
      setRoutines(prev => prev.map(r => r.id === expandedRoutine ? { ...r, routine_exercises: exs } : r))
    }
    toast('Ejercicio actualizado')
  }

  const deleteExercise = async (exId: number, routineId: string) => {
    await supabase.from('routine_exercises').delete().eq('id', exId)
    setRoutines(prev => prev.map(r => r.id === routineId
      ? { ...r, routine_exercises: r.routine_exercises.filter(e => e.id !== exId) }
      : r
    ))
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: '#6B7895' }}>
        Cargando usuarios...
      </p>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
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
        <style>{`@keyframes homeCardIn{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={18} style={{ color: '#A8B3CF' }} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-black uppercase text-white truncate">{selectedUser.full_name}</h1>
            <p className="text-[10px] uppercase font-bold" style={{ color: selectedUser.role === 'admin' ? '#00E5A8' : '#6B7895' }}>
              {selectedUser.role} · {selectedUser.email || ''}
            </p>
          </div>
        </div>

        {/* Toasts */}
        {success && (
          <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background: 'rgba(0,229,168,0.1)', border: '1px solid rgba(0,229,168,0.25)', color: '#00E5A8' }}>
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
            ✕ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', color: '#fff', boxShadow: '0 4px 16px rgba(0,229,168,0.35)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7895' }
              }
            >{label}</button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
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
                <div>
                  <label style={lbl}>Rol</label>
                  <select style={inp} value={editProfile.role || 'user'} onChange={e => setEditProfile(p => ({...p, role: e.target.value}))}>
                    <option value="user">user</option><option value="admin">admin</option>
                  </select>
                </div>
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
                                  : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }}
                      >{opt}</button>
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

            {/* Nueva rutina */}
            <div className="flex gap-2" style={card as React.CSSProperties}>
              <div className="flex gap-2 p-4 w-full">
                <input
                  style={{ ...inp, flex: 1 } as React.CSSProperties}
                  placeholder="Nombre de nueva rutina..."
                  value={newRoutineName}
                  onChange={e => setNewRoutineName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createRoutine()}
                />
                <button
                  onClick={createRoutine}
                  className="px-4 rounded-xl font-black uppercase text-xs text-white transition-all active:scale-95 shrink-0"
                  style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 4px 16px rgba(0,229,168,0.3)' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Lista rutinas */}
            {routines.length === 0 && (
              <div className="text-center py-12" style={card}>
                <Dumbbell size={32} className="mx-auto mb-3 opacity-30" style={{ color: '#6B7895' }} />
                <p className="text-sm font-bold uppercase" style={{ color: '#6B7895' }}>Sin rutinas asignadas</p>
              </div>
            )}

            {routines.map(routine => (
              <div key={routine.id} style={{ ...card, overflow: 'hidden' }}>

                {/* Routine header */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      const isOpen = expandedRoutine === routine.id
                      setExpandedRoutine(isOpen ? null : routine.id)
                      if (!isOpen) {
                        const exs = await loadExercises(routine.id)
                        setRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, routine_exercises: exs } : r))
                      }
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <ChevronDown size={16} style={{ color:'#6B7895', transition:'transform 0.2s', transform: expandedRoutine===routine.id?'rotate(180deg)':'rotate(0deg)' }} />
                    <div>
                      <p className="font-black text-sm text-white">{routine.name}</p>
                      <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>
                        {routine.routine_exercises?.length || 0} ejercicios
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}
                  >
                    <Trash2 size={15} style={{ color:'#ef4444' }} />
                  </button>
                </div>

                {/* Exercises */}
                {expandedRoutine === routine.id && (
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <div className="pt-3" />
                    {(!routine.routine_exercises || routine.routine_exercises.length === 0) && (
                      <p className="text-xs text-center py-4" style={{ color:'#6B7895' }}>Sin ejercicios en esta rutina</p>
                    )}
                    {(routine.routine_exercises || []).map((ex) => {
                      const isEditing = !!editingEx[ex.id]
                      const draft = editingEx[ex.id] || ex
                      return (
                        <div
                          key={ex.id}
                          className="rounded-2xl overflow-hidden transition-all"
                          style={{ background:'rgba(255,255,255,0.03)', border: isEditing ? '1px solid rgba(0,229,168,0.25)' : '1px solid rgba(255,255,255,0.05)' }}
                        >
                          {/* Exercise name row */}
                          <div className="flex items-center justify-between px-4 py-3">
                            <p className="text-sm font-bold truncate" style={{ color:'#00E5A8' }}>
                              {ex.name || 'Ejercicio'}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              {isEditing ? (
                                <button
                                  onClick={() => saveExercise(ex.id)}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                  style={{ background:'rgba(0,229,168,0.15)', border:'1px solid rgba(0,229,168,0.3)' }}
                                >
                                  <Check size={14} style={{ color:'#00E5A8' }} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingEx(prev => ({...prev, [ex.id]: {...ex}}))}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
                                >
                                  <Edit2 size={13} style={{ color:'#6B7895' }} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteExercise(ex.id, routine.id)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                                style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}
                              >
                                <Trash2 size={13} style={{ color:'#ef4444' }} />
                              </button>
                            </div>
                          </div>

                          {/* Editable fields */}
                          <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                            {[
                              { label:'Series', field:'sets',      type:'number' },
                              { label:'Reps',   field:'reps',      type:'text'   },
                              { label:'Desc (s)',field:'rest_time', type:'number' },
                            ].map(({ label, field, type }) => (
                              <div key={field}>
                                <label style={{ ...lbl, marginBottom: 4 }}>{label}</label>
                                <input
                                  type={type}
                                  disabled={!isEditing}
                                  value={(draft as any)[field] ?? ''}
                                  onChange={e => setEditingEx(prev => ({
                                    ...prev,
                                    [ex.id]: { ...prev[ex.id], [field]: type === 'number' ? Number(e.target.value) : e.target.value }
                                  }))}
                                  className="text-center font-bold text-sm"
                                  style={{
                                    ...inp,
                                    padding: '8px 4px',
                                    opacity: isEditing ? 1 : 0.6,
                                    color: isEditing ? '#00E5A8' : '#A8B3CF',
                                    border: isEditing ? '1px solid rgba(0,229,168,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                  } as React.CSSProperties}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
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
      <style>{`@keyframes homeCardIn{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color:'#6B7895' }}>Panel</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Administración</h1>
        </div>
        <div className="p-3 rounded-2xl" style={{ background:'linear-gradient(135deg,#7C5CFF,#00C2FF)', boxShadow:'0 4px 20px rgba(124,92,255,0.35)' }}>
          <Shield size={22} className="text-white" />
        </div>
      </div>

      {/* Toasts */}
      {success && (
        <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(0,229,168,0.1)', border:'1px solid rgba(0,229,168,0.25)', color:'#00E5A8' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-2xl text-sm font-bold text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#ef4444' }}>
          ✕ {error}
        </div>
      )}

      {/* Stats + Crear usuario */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-[20px] flex items-center gap-3" style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(124,92,255,0.15)' }}>
            <Users size={18} style={{ color:'#7C5CFF' }} />
          </div>
          <div>
            <p className="text-2xl font-black text-white leading-none">{users.length}</p>
            <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color:'#6B7895' }}>Usuarios</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="p-4 rounded-[20px] flex items-center gap-3 transition-all active:scale-[0.97]"
          style={{ background:'linear-gradient(135deg,rgba(0,229,168,0.15),rgba(0,194,255,0.1))', border:'1px solid rgba(0,229,168,0.25)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' }}
        >
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
          <button
            key={user.id}
            onClick={() => selectUser(user)}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
            style={{ background:'rgba(18,26,42,0.9)', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)', animation:`homeCardIn 0.4s ease-out ${idx*0.05}s both` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                style={user.role==='admin'
                  ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                  : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }
                }
              >
                {(user.full_name||'?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white truncate">{user.full_name}</p>
                <p className="text-[10px] uppercase font-bold mt-0.5 truncate" style={{ color:'#6B7895' }}>
                  {user.gender} · {user.age} años · {user.weight}kg
                  {' · '}<span style={{ color: user.role==='admin'?'#00E5A8':'#6B7895' }}>{user.role}</span>
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color:'#6B7895', flexShrink:0 }} />
          </button>
        ))}
      </div>

      {/* ── CREATE USER MODAL ───────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-[1500] flex items-end justify-center p-4 pb-8" style={{ background:'rgba(11,18,32,0.85)', backdropFilter:'blur(16px)' }}>
          <div
            className="w-full max-w-sm rounded-[24px] p-6 space-y-5"
            style={{ background:'rgba(18,26,42,0.98)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', animation:'homeCardIn 0.35s ease-out both' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color:'#6B7895' }}>Admin</p>
                <h2 className="text-lg font-black uppercase text-white">Nuevo Usuario</h2>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
              >
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
                  <input
                    type={type} placeholder={placeholder}
                    style={inp}
                    value={(newUser as any)[field]}
                    onChange={e => setNewUser(p => ({...p, [field]: e.target.value}))}
                  />
                </div>
              ))}
              <div>
                <label style={lbl}>Rol</label>
                <div className="flex gap-2">
                  {['user','admin'].map(r => (
                    <button key={r} type="button"
                      onClick={() => setNewUser(p => ({...p, role: r}))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95"
                      style={newUser.role===r
                        ? { background:'linear-gradient(135deg,#00E5A8,#00C2FF)', color:'#fff' }
                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#6B7895' }
                      }
                    >{r}</button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateUser} disabled={creating}
              style={{ ...btnPrimary, opacity: creating?0.6:1 } as React.CSSProperties}
              className="transition-all active:scale-[0.97]"
            >
              <UserPlus size={16} /> {creating ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
