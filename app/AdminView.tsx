'use client'
import { useState, useEffect } from 'react'
import { User, Utensils, Dumbbell, ChevronRight, X, Save, Plus, Trash2 } from 'lucide-react'

type Profile = {
  id: string
  full_name: string
  weight: string
  height: string
  age: number
  gender: string
  role: string
}

type Meal = {
  name: string
  protein: string[]
  carbs: string[]
  fat: string[]
}

const MEAL_NAMES = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Media Tarde', 'Cena']

export default function AdminView({ supabase }: { supabase: any }) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'nutrition' | 'profile'>('nutrition')
  const [meals, setMeals] = useState<Meal[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
  supabase
    .from('profiles')
    .select('*')
    .then(({ data }: any) => {
      setUsers(data || [])
      setLoading(false)
    })
}, [])

  const loadUserNutrition = async (user: Profile) => {
    setSelectedUser(user)
    setActiveTab('nutrition')
    const { data } = await supabase.from('nutrition_plans').select('*').eq('user_id', user.id).single()
    if (data?.meals) {
      setMeals(data.meals)
    } else {
      setMeals(MEAL_NAMES.map(name => ({ name, protein: [], carbs: [], fat: [] })))
    }
  }

  const updateMealItems = (mealIdx: number, type: 'protein' | 'carbs' | 'fat', value: string) => {
    setMeals(prev => prev.map((meal, i) =>
      i === mealIdx ? { ...meal, [type]: value.split('\n').filter(Boolean) } : meal
    ))
  }

  const saveNutrition = async () => {
    if (!selectedUser) return
    setSaving(true)
    const { data: existing } = await supabase.from('nutrition_plans').select('id').eq('user_id', selectedUser.id).single()
    if (existing) {
      await supabase.from('nutrition_plans').update({ meals }).eq('user_id', selectedUser.id)
    } else {
      await supabase.from('nutrition_plans').insert([{ user_id: selectedUser.id, meals }])
    }
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  if (loading) return <div className="flex items-center justify-center h-40"><p className="text-gray-500 animate-pulse">Cargando usuarios...</p></div>

  if (selectedUser) {
    return (
      <div className="space-y-4 animate-in fade-in pb-28">
        <div className="flex items-center gap-3 px-2">
          <button onClick={() => setSelectedUser(null)} className="bg-gray-800 p-2 rounded-xl border border-gray-700">
            <X size={18} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter">{selectedUser.full_name}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-2">
          <button onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${activeTab === 'nutrition' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
            <Utensils size={14} className="inline mr-1" /> Nutrición
          </button>
          <button onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${activeTab === 'profile' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
            <User size={14} className="inline mr-1" /> Perfil
          </button>
        </div>

        {/* Nutrición */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            {meals.map((meal, mealIdx) => (
              <div key={mealIdx} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-3">
                  <h2 className="font-black uppercase text-sm text-emerald-400">{meal.name}</h2>
                </div>
                <div className="p-4 space-y-3">
                  {(['protein', 'carbs', 'fat'] as const).map(type => (
                    <div key={type}>
                      <label className="text-[10px] text-gray-500 uppercase font-black mb-1 block">
                        {type === 'protein' ? '🥩 Proteína' : type === 'carbs' ? '🌾 Carbohidrato' : '🥑 Grasa'} (una por línea)
                      </label>
                      <textarea
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-emerald-500 h-20 resize-none"
                        value={meal[type].join('\n')}
                        onChange={e => updateMealItems(mealIdx, type, e.target.value)}
                        placeholder={`Ej: Pollo (100g)\nAtún en agua`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={saveNutrition} disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-2xl py-4 font-black uppercase text-white flex items-center justify-center gap-2">
              <Save size={18} />
              {saving ? 'Guardando...' : success ? '✅ Guardado' : 'Guardar Plan'}
            </button>
          </div>
        )}

        {/* Perfil */}
        {activeTab === 'profile' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Peso</p>
                <p className="text-xl font-bold">{selectedUser.weight}kg</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Altura</p>
                <p className="text-xl font-bold">{selectedUser.height}m</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Edad</p>
                <p className="text-xl font-bold">{selectedUser.age} años</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Género</p>
                <p className="text-xl font-bold">{selectedUser.gender}</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Rol</p>
              <p className="text-sm font-bold text-emerald-400">{selectedUser.role || 'user'}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in pb-28">
      <h1 className="text-3xl font-black uppercase tracking-tighter px-2">Admin</h1>
      <p className="text-xs text-gray-500 px-2 uppercase font-bold">Selecciona un usuario para gestionar</p>
      <div className="space-y-2">
        {users.map(user => (
          <button key={user.id} onClick={() => loadUserNutrition(user)}
            className="w-full bg-gray-800 rounded-2xl border border-gray-700 p-4 flex items-center justify-between hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <User size={20} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm">{user.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{user.gender} · {user.age} años · {user.weight}kg</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  )
}
