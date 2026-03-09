'use client'
import { useState, useEffect } from 'react'
import { User, ChevronRight, X, Save, Trash2 } from 'lucide-react'

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
}

const MEAL_NAMES = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']
const FOCUS_OPTIONS = ['Hipertrofia', 'Fuerza', 'Pérdida de Grasa', 'Resistencia', 'Salud']

export default function AdminView({ supabase }: { supabase: any }) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'nutrition' | 'routines' | 'adicionales'>('profile')
  const [meals, setMeals] = useState<Meal[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

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
    const { data: ruts } = await supabase.from('routines').select('*').eq('user_id', user.id)
    setRoutines(ruts || [])
  }

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2000) }

  const saveProfile = async () => {
    if (!selectedUser) return
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: editProfile.full_name,
      weight: editProfile.weight,
      height: editProfile.height,
      age: editProfile.age,
      gender: editProfile.gender,
      experience_level: editProfile.experience_level,
      training_days: editProfile.training_days,
      injuries: editProfile.injuries,
      diet_style: editProfile.diet_style,
      focus_areas: editProfile.focus_areas,
    }).eq('id', selectedUser.id)
    setSaving(false)
    showSuccess('✅ Guardado')
  }

  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { data: existing } = await supabase.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).single()
    if (existing) await supabase.from('nutrition_plans').update({ meals }).eq('user_id', selectedUser.id)
    else await supabase.from('nutrition_plans').insert([{ user_id: selectedUser.id, meals }])
    setSaving(false)
    showSuccess('✅ Nutrición guardada')
  }

  const updateMealItems = (mealIdx: number, type: 'protein' | 'carbs' | 'fat', value: string) => {
    setMeals(prev => prev.map((meal, i) => i === mealIdx ? { ...meal, [type]: value.split('\n').filter(Boolean) } : meal))
  }

  const deleteRoutine = async (routineId: string) => {
    if (!confirm('¿Eliminar esta rutina?')) return
    await supabase.from('routines').delete().eq('id', routineId)
    setRoutines(prev => prev.filter(r => r.id !== routineId))
    showSuccess('✅ Rutina eliminada')
  }

  if (loading) return <div className="flex items-center justify-center h-40"><p className="text-gray-500 animate-pulse">Cargando usuarios...</p></div>

  if (selectedUser) {
    return (
      <div className="space-y-4 animate-in fade-in pb-28">
        <div className="flex items-center gap-3 px-2">
          <button onClick={() => setSelectedUser(null)} className="bg-gray-800 p-2 rounded-xl border border-gray-700"><X size={18} /></button>
          <div>
            <h1 className="text-xl font-black uppercase">{selectedUser.full_name}</h1>
            <p className="text-[10px] text-gray-500 uppercase">{selectedUser.role}</p>
          </div>
        </div>

        {success && <div className="mx-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-4 py-2 text-emerald-400 text-sm font-bold text-center">{success}</div>}

        <div className="flex gap-1 px-2 overflow-x-auto">
          {(['profile', 'nutrition', 'routines', 'adicionales'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${activeTab === tab ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              {tab === 'profile' ? '👤 Perfil' : tab === 'nutrition' ? '🥗 Nutrición' : tab === 'routines' ? '💪 Rutinas' : '📝 Adicionales'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Nombre completo</label>
                <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.full_name || ''} onChange={e => setEditProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Peso (kg)</label>
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.weight || ''} onChange={e => setEditProfile(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Altura (m)</label>
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.height || ''} onChange={e => setEditProfile(p => ({ ...p, height: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Edad</label>
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.age || ''} onChange={e => setEditProfile(p => ({ ...p, age: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Género</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.gender || ''} onChange={e => setEditProfile(p => ({ ...p, gender: e.target.value }))}>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Días entreno</label>
                  <input type="number" min="1" max="7" className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.training_days || ''} onChange={e => setEditProfile(p => ({ ...p, training_days: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Nivel</label>
                  <select className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.experience_level || ''} onChange={e => setEditProfile(p => ({ ...p, experience_level: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Áreas de enfoque</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => { const current = editProfile.focus_areas || []; const newF = current.includes(opt) ? current.filter(f => f !== opt) : [...current, opt]; setEditProfile(p => ({ ...p, focus_areas: newF })) }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${(editProfile.focus_areas || []).includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl py-4 font-black uppercase text-white flex items-center justify-center gap-2">
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            {meals.map((meal, mealIdx) => (
              <div key={mealIdx} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-3"><h2 className="font-black uppercase text-sm text-emerald-400">{meal.name}</h2></div>
                <div className="p-4 space-y-3">
                  {(['protein', 'carbs', 'fat'] as const).map(type => (
                    <div key={type}>
                      <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">
                        {type === 'protein' ? '🥩 Proteína' : type === 'carbs' ? '🌾 Carbohidrato' : '🥑 Grasa'} (una por línea)
                      </label>
                      <textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-emerald-500 h-20 resize-none"
                        value={meal[type].join('\n')} onChange={e => updateMealItems(mealIdx, type, e.target.value)} placeholder="Ej: Pollo (100g)" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={saveNutrition} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl py-4 font-black uppercase text-white flex items-center justify-center gap-2">
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Nutrición'}
            </button>
          </div>
        )}

        {activeTab === 'routines' && (
          <div className="space-y-3">
            {routines.length === 0 && <div className="text-center py-10 text-gray-500 text-sm">Sin rutinas asignadas</div>}
            {routines.map(routine => (
              <div key={routine.id} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-sm">{routine.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{routine.exercises?.length || 0} ejercicios</p>
                </div>
                <button onClick={() => deleteRoutine(routine.id)} className="bg-red-500/20 border border-red-500/50 p-2 rounded-xl text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'adicionales' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Estilo de dieta</label>
                <input className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500" value={editProfile.diet_style || ''} onChange={e => setEditProfile(p => ({ ...p, diet_style: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">Adicionales / Notas</label>
                <textarea className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 h-32 resize-none" value={editProfile.injuries || ''} onChange={e => setEditProfile(p => ({ ...p, injuries: e.target.value }))} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl py-4 font-black uppercase text-white flex items-center justify-center gap-2">
              <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Adicionales'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in pb-28">
      <h1 className="text-3xl font-black uppercase tracking-tighter px-2">Admin</h1>
      <p className="text-xs text-gray-500 px-2 uppercase font-bold tracking-widest">Gestionar usuarios</p>
      <div className="space-y-2">
        {users.map(user => (
          <button key={user.id} onClick={() => selectUser(user)}
            className="w-full bg-gray-800 rounded-2xl border border-gray-700 p-4 flex items-center justify-between hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${user.role === 'admin' ? 'bg-emerald-500/20' : 'bg-gray-700'}`}>
                <User size={20} className={user.role === 'admin' ? 'text-emerald-400' : 'text-gray-400'} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm">{user.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{user.gender} · {user.age} años · {user.weight}kg · <span className={user.role === 'admin' ? 'text-emerald-400' : 'text-gray-600'}>{user.role}</span></p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  )
}