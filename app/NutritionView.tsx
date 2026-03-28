'use client'
import { useState, useEffect } from 'react'
import { Utensils, Pencil, Check, X } from 'lucide-react'

const DEFAULT_SALADS = [
  { name: "🌴 Tropical Caribe", ingredients: "Papaya, mango, pepino, limón, semillas de chía", benefit: "Digestiva y antiinflamatoria" },
  { name: "🥕 Andina Energética", ingredients: "Zanahoria rallada, papa criolla, espinaca baby, aguacate", benefit: "Rica en potasio" },
  { name: "🌽 Campesina Suave", ingredients: "Maíz tierno, tomate cherry, pepino, aceite de oliva", benefit: "Aporte de fibra moderada" },
  { name: "🍍 Dulce del Valle", ingredients: "Piña, manzana verde, semillas de girasol", benefit: "Enzimas digestivas" },
  { name: "🥑 Pacífica Proteica", ingredients: "Aguacate, tomate, pepino, atún desmenuzado", benefit: "Alta en omega y proteínas" },
]

const MEAL_ICONS: Record<string, string> = {
  'Desayuno': '🌅',
  'Media Mañana': '🍎',
  'Almuerzo': '🍽️',
  'Media Tarde': '🥗',
  'Cena': '🌙',
}

const DEFAULT_WATER_GOAL = 8

export default function NutritionView({
  userId,
  supabase,
  userRole,
}: {
  userId: string | undefined
  supabase: any
  userRole?: string
}) {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [water, setWater] = useState(0)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(DEFAULT_WATER_GOAL)
  const [savingGoal, setSavingGoal] = useState(false)

  const canEdit = userRole === 'coach' || userRole === 'admin'

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }: any) => {
        if (error) console.error('nutrition_plans error:', JSON.stringify(error))
        setPlan(data?.[0] ?? null)
        setLoading(false)
      })
  }, [userId])

  const waterGoal = plan?.water_goal || DEFAULT_WATER_GOAL

  const openEditGoal = () => {
    setGoalInput(waterGoal)
    setEditingGoal(true)
  }

  const saveWaterGoal = async () => {
    if (!userId) return
    setSavingGoal(true)
    const { data: ex } = await supabase.from('nutrition_plans').select('id').eq('user_id', userId).single()
    if (ex) {
      await supabase.from('nutrition_plans').update({ water_goal: goalInput }).eq('user_id', userId)
    } else {
      await supabase.from('nutrition_plans').insert([{ user_id: userId, water_goal: goalInput, meals: [] }])
    }
    setPlan((prev: any) => ({ ...(prev || {}), water_goal: goalInput }))
    setSavingGoal(false)
    setEditingGoal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 animate-pulse">Cargando plan...</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-60 space-y-4 text-center px-6">
        <Utensils size={48} className="text-gray-700" />
        <p className="text-gray-400 font-bold uppercase text-sm">Sin plan asignado</p>
        <p className="text-gray-600 text-xs">Tu entrenador aún no ha asignado tu plan de nutrición</p>
      </div>
    )
  }

  const salads = plan.salads?.length > 0 ? plan.salads : DEFAULT_SALADS

  return (
    <div className="space-y-4 animate-in fade-in pb-28">
      <h1 className="text-3xl font-black uppercase tracking-tighter px-2">Nutrición</h1>

      {/* Contador de agua */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💧</span>
            <p className="font-black uppercase text-sm text-blue-400">Agua del día</p>
          </div>
          <div className="flex items-center gap-2">
            {editingGoal ? (
              <>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={goalInput}
                  onChange={e => setGoalInput(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-14 text-center rounded-lg bg-gray-700 border border-gray-600 text-white text-xs font-bold py-1 outline-none"
                />
                <span className="text-xs text-gray-400">vasos</span>
                <button
                  onClick={saveWaterGoal}
                  disabled={savingGoal}
                  className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Check size={13} className="text-white" />
                </button>
                <button onClick={() => setEditingGoal(false)} className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600">
                  <X size={13} className="text-gray-300" />
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-gray-400">{water} / {waterGoal} vasos</p>
                {canEdit && (
                  <button onClick={openEditGoal} className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600">
                    <Pencil size={12} className="text-gray-400" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <div
              key={i}
              onClick={() => setWater(i + 1)}
              className={`flex-1 h-8 rounded-lg cursor-pointer transition-all ${i < water ? 'bg-blue-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWater(w => Math.min(w + 1, waterGoal))}
            className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-2 text-xs font-black uppercase"
          >
            + Vaso
          </button>
          <button
            type="button"
            onClick={() => setWater(0)}
            className="bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-2 text-xs font-black uppercase text-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Comidas */}
      {plan.meals?.map((meal: any, i: number) => (
        <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{MEAL_ICONS[meal.name] || '🍴'}</span>
            <h2 className="font-black uppercase text-sm text-emerald-400">{meal.name}</h2>
          </div>
          <div className="p-4 space-y-3">
            {(['protein', 'carbs', 'fat'] as const).map((type) =>
              meal[type]?.length > 0 ? (
                <div key={type}>
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-2">
                    {type === 'protein' ? '🥩 Proteína' : type === 'carbs' ? '🌾 Carbohidrato' : '🥑 Grasa'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {meal[type].map((item: string, j: number) => (
                      <span key={j} className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1 text-xs text-gray-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      ))}

      {/* Ensaladas */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-700/50 px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🥗</span>
          <h2 className="font-black uppercase text-sm text-emerald-400">Ensaladas Recomendadas</h2>
        </div>
        <div className="p-4 space-y-3">
          {salads.map((salad: any, i: number) => (
            <div key={i} className="bg-gray-900 rounded-xl p-3 border border-gray-700">
              <p className="font-bold text-sm text-white mb-1">{salad.name}</p>
              <p className="text-xs text-gray-400 mb-1">{salad.ingredients}</p>
              <p className="text-[10px] text-emerald-500 uppercase font-bold">{salad.benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
