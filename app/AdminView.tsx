'use client'
import { useState, useEffect } from 'react'
import { User, ChevronRight, X, Save, Trash2, ChevronDown, Shield, Users } from 'lucide-react'

type Profile = {
  id: string
  full_name: string
  weight: string
  height: string
  age: number
  gender: string
  role: string
  experience_level: string
  training_days: number
  injuries: string
  diet_style: string
  focus_areas: string[]
}

type Meal = {
  name: string
  protein: string[]
  carbs: string[]
  fat: string[]
}

type Routine = {
  id: string
  name: string
  exercises: any[]
  routine_exercises: any[]
}

const MEAL_NAMES = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud']

// ── Design tokens ─────────────────────────────────────────────────────────────
const card  = { background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }
const input = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', outline: 'none', width: '100%', padding: '12px 14px', fontSize: 14 }
const labelStyle: React.CSSProperties = { fontSize: 10, color: '#6B7895', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }

export default function AdminView({ supabase }: { supabase: any }) {
  const [users, setUsers]               = useState<Profile[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab]       = useState<'profile' | 'nutrition' | 'routines' | 'notas'>('profile')
  const [meals, setMeals]               = useState<Meal[]>([])
  const [routines, setRoutines]         = useState<Routine[]>([])
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null)
  const [editProfile, setEditProfile]   = useState<Partial<Profile>>({})
  const [saving, setSaving]             = useState(false)
  const [success, setSuccess]           = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }: any) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  const selectUser = async (user: Profile) => {
    setSelectedUser(user)
    setEditProfile(user)
    setActiveTab('profile')
    const { data: nutrition } = await supabase.from('nutrition_plans').select('*').eq('user_id', user.id).single()
    if (nutrition?.meals) setMeals(nutrition.meals)
    else setMeals(MEAL_NAMES.map(name => ({ name, protein: [], carbs: [], fat: [] })))
    const { data: ruts } = await supabase.from('routines').select('*, routine_exercises(*)').eq('user_id', user.id)
    setRoutines(ruts || [])
  }

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500) }

  const saveProfile = async () => {
    if (!selectedUser) return
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: editProfile.full_name, weight: editProfile.weight, height: editProfile.height,
      age: editProfile.age, gender: editProfile.gender, experience_level: editProfile.experience_level,
      training_days: editProfile.training_days, injuries: editProfile.injuries,
      diet_style: editProfile.diet_style, focus_areas: editProfile.focus_areas,
    }).eq('id', selectedUser.id)
    setSaving(false)
    showSuccess('Guardado correctamente')
  }

  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { data: existing } = await supabase.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).single()
    if (existing) await supabase.from('nutrition_plans').update({ meals }).eq('user_id', selectedUser.id)
    else await supabase.from('nutrition_plans').insert([{ user_id: selectedUser.id, meals }])
    setSaving(false)
    showSuccess('Nutrición guardada')
  }

  const updateMealItems = (mealIdx: number, type: 'protein' | 'carbs' | 'fat', value: string) => {
    setMeals(prev => prev.map((meal, i) => i === mealIdx ? { ...meal, [type]: value.split('\n').filter(Boolean) } : meal))
  }

  const deleteRoutine = async (routineId: string) => {
    if (!confirm('¿Eliminar esta rutina?')) return
    await supabase.from('routines').delete().eq('id', routineId)
    setRoutines(prev => prev.filter(r => r.id !== routineId))
    showSuccess('Rutina eliminada')
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: '#6B7895' }}>
        Cargando usuarios...
      </p>
    </div>
  )

  // ── User detail ────────────────────────────────────────────────────────────
  if (selectedUser) {
    const TABS = [
      { key: 'profile',   label: 'Perfil'     },
      { key: 'nutrition', label: 'Nutrición'  },
      { key: 'routines',  label: 'Rutinas'    },
      { key: 'notas',     label: 'Notas'      },
    ] as const

    return (
      <div className="space-y-5 pb-28">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={18} style={{ color: '#A8B3CF' }} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase text-white">{selectedUser.full_name}</h1>
            <p className="text-[10px] uppercase font-bold" style={{ color: selectedUser.role === 'admin' ? '#00E5A8' : '#6B7895' }}>
              {selectedUser.role}
            </p>
          </div>
        </div>

        {/* Success toast */}
        {success && (
          <div
            className="px-4 py-3 rounded-2xl text-sm font-bold text-center"
            style={{ background: 'rgba(0,229,168,0.1)', border: '1px solid rgba(0,229,168,0.25)', color: '#00E5A8' }}
          >
            ✓ {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', color: '#fff', boxShadow: '0 4px 16px rgba(0,229,168,0.35)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7895' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="p-5 space-y-4" style={card}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input style={input} value={editProfile.full_name || ''} onChange={e => setEditProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Peso (kg)',  key: 'weight',        type: 'number' },
                  { label: 'Altura (m)', key: 'height',        type: 'number' },
                  { label: 'Edad',       key: 'age',           type: 'number' },
                  { label: 'Días entreno', key: 'training_days', type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type={type}
                      style={input}
                      value={(editProfile as any)[key] || ''}
                      onChange={e => setEditProfile(p => ({ ...p, [key]: type === 'number' ? parseFloat(e.target.value) || e.target.value : e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Género</label>
                  <select style={{ ...input }} value={editProfile.gender || ''} onChange={e => setEditProfile(p => ({ ...p, gender: e.target.value }))}>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nivel</label>
                  <select style={{ ...input }} value={editProfile.experience_level || ''} onChange={e => setEditProfile(p => ({ ...p, experience_level: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Áreas de enfoque</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map(opt => {
                    const active = (editProfile.focus_areas || []).includes(opt)
                    return (
                      <button
                        key={opt} type="button"
                        onClick={() => {
                          const cur = editProfile.focus_areas || []
                          setEditProfile(p => ({ ...p, focus_areas: cur.includes(opt) ? cur.filter(f => f !== opt) : [...cur, opt] }))
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={active
                          ? { background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', color: '#fff', boxShadow: '0 2px 12px rgba(0,229,168,0.3)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6B7895' }
                        }
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={saveProfile} disabled={saving}
              className="w-full py-4 rounded-[20px] font-black uppercase text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 24px rgba(0,229,168,0.4)' }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        )}

        {/* ── TAB: NUTRITION ── */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            {meals.map((meal, mealIdx) => (
              <div key={mealIdx} style={card} className="overflow-hidden">
                <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,229,168,0.05)' }}>
                  <h2 className="font-black uppercase text-sm" style={{ color: '#00E5A8' }}>{meal.name}</h2>
                </div>
                <div className="p-5 space-y-4">
                  {(['protein', 'carbs', 'fat'] as const).map(type => (
                    <div key={type}>
                      <label style={labelStyle}>
                        {type === 'protein' ? '🥩 Proteína' : type === 'carbs' ? '🌾 Carbohidrato' : '🥑 Grasa'} — una por línea
                      </label>
                      <textarea
                        className="resize-none"
                        style={{ ...input, height: 80, fontSize: 13, lineHeight: 1.6 } as React.CSSProperties}
                        value={meal[type].join('\n')}
                        onChange={e => updateMealItems(mealIdx, type, e.target.value)}
                        placeholder="Ej: Pollo (100g)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={saveNutrition} disabled={saving}
              className="w-full py-4 rounded-[20px] font-black uppercase text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 24px rgba(0,229,168,0.4)' }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Nutrición'}
            </button>
          </div>
        )}

        {/* ── TAB: ROUTINES ── */}
        {activeTab === 'routines' && (
          <div className="space-y-3">
            {routines.length === 0 && (
              <div className="text-center py-12" style={card}>
                <p className="text-sm font-bold uppercase" style={{ color: '#6B7895' }}>Sin rutinas asignadas</p>
              </div>
            )}
            {routines.map(routine => (
              <div key={routine.id} style={{ ...card, overflow: 'hidden' }}>
                <div className="px-5 py-4 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <ChevronDown
                      size={16}
                      style={{ color: '#6B7895', transition: 'transform 0.2s', transform: expandedRoutine === routine.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                    <div>
                      <p className="font-black text-sm text-white">{routine.name}</p>
                      <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: '#6B7895' }}>
                        {routine.routine_exercises?.length || 0} ejercicios
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <Trash2 size={15} style={{ color: '#ef4444' }} />
                  </button>
                </div>
                {expandedRoutine === routine.id && routine.routine_exercises && routine.routine_exercises.length > 0 && (
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="pt-3" />
                    {routine.routine_exercises.map((ex: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#00E5A8' }}>{ex.name || `Ejercicio ${idx + 1}`}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#6B7895' }}>{ex.sets} series × {ex.reps} reps</p>
                        </div>
                        <p className="text-xs font-bold" style={{ color: '#A8B3CF' }}>{ex.weight || '—'} kg</p>
                      </div>
                    ))}
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
                <label style={labelStyle}>Estilo de dieta</label>
                <input style={input} value={editProfile.diet_style || ''} onChange={e => setEditProfile(p => ({ ...p, diet_style: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Notas / Lesiones</label>
                <textarea
                  className="resize-none"
                  style={{ ...input, height: 120 } as React.CSSProperties}
                  value={editProfile.injuries || ''}
                  onChange={e => setEditProfile(p => ({ ...p, injuries: e.target.value }))}
                />
              </div>
            </div>
            <button
              onClick={saveProfile} disabled={saving}
              className="w-full py-4 rounded-[20px] font-black uppercase text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#00E5A8,#00C2FF)', boxShadow: '0 8px 24px rgba(0,229,168,0.4)' }}
            >
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Notas'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── User list ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-28">
      <style>{`@keyframes homeCardIn { from { transform:translateY(28px); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#6B7895' }}>Panel</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Administración</h1>
        </div>
        <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg,#7C5CFF,#00C2FF)', boxShadow: '0 4px 20px rgba(124,92,255,0.35)' }}>
          <Shield size={22} className="text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 rounded-[20px] flex items-center gap-4" style={{ background: 'rgba(18,26,42,0.9)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,92,255,0.15)' }}>
          <Users size={18} style={{ color: '#7C5CFF' }} />
        </div>
        <div>
          <p className="text-2xl font-black text-white leading-none">{users.length}</p>
          <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: '#6B7895' }}>Usuarios registrados</p>
        </div>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {users.map((user, idx) => (
          <button
            key={user.id}
            onClick={() => selectUser(user)}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-[20px] text-left transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(18,26,42,0.9)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              animation: `homeCardIn 0.4s ease-out ${idx * 0.05}s both`
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={user.role === 'admin'
                  ? { background: 'rgba(0,229,168,0.12)', border: '1px solid rgba(0,229,168,0.2)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                <User size={18} style={{ color: user.role === 'admin' ? '#00E5A8' : '#6B7895' }} />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white truncate">{user.full_name}</p>
                <p className="text-[10px] uppercase font-bold mt-0.5 truncate" style={{ color: '#6B7895' }}>
                  {user.gender} · {user.age} años · {user.weight}kg
                  {' · '}
                  <span style={{ color: user.role === 'admin' ? '#00E5A8' : '#6B7895' }}>{user.role}</span>
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#6B7895', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  )
}
