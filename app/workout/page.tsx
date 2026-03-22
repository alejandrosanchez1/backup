'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { toast } from 'sonner'
import { ExerciseSearch } from '@/components/ExerciseSearch'

export default function WorkoutSessionPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white font-black italic">CARGANDO...</div>}>
      <WorkoutSession />
    </Suspense>
  )
}

function WorkoutSession() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const routineId = searchParams.get('routineId')

  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState<any[]>([])
  const [history, setHistory] = useState<Record<string, any>>({})
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  // 1. AÑADIR EJERCICIO
  const addNewExercise = (newEx: any) => {
    if (exercises.find(ex => ex.id === newEx.id)) {
      return toast.error("Este ejercicio ya está en tu lista")
    }
    setExercises(prev => [newEx, ...prev]) // Los nuevos aparecen arriba
    toast.success(`${newEx.name} añadido`)
  }

  // 2. ELIMINAR EJERCICIO
  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id))
    const newValues = { ...formValues }
    delete newValues[id]
    setFormValues(newValues)
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      if (routineId) {
        const { data } = await supabase
          .from('routine_exercises')
          .select('exercises_library(*)')
          .eq('routine_id', routineId)
        
        const list = data?.map((item: any) => item.exercises_library).filter(Boolean) || []
        setExercises(list)
      }
      setLoading(false)
    }
    fetchData()
  }, [routineId, router])

  // 3. GUARDAR ENTRENAMIENTO
  const saveWorkout = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay sesión de usuario")

      // Formatear datos para la tabla workout_logs
      const workoutData = exercises.map(ex => ({
        exercise_name: ex.name,
        weight: parseFloat(formValues[ex.id]?.weight || 0),
        reps: parseInt(formValues[ex.id]?.reps || 0)
      })).filter(ex => ex.weight > 0 || ex.reps > 0)

      if (workoutData.length === 0) {
        return toast.error("Anota al menos un ejercicio")
      }

      const { error } = await supabase.from('workout_logs').insert([{
        user_id: user.id,
        routine_id: routineId || null,
        workout_details: workoutData, // Se guarda como JSONB
        date: new Date().toISOString()
      }])

      if (error) throw error

      toast.success("¡ENTRENAMIENTO COMPLETADO! 🔥")
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) return <div className="p-10 text-center text-white animate-pulse font-black italic text-2xl">PREPARANDO...</div>

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32 text-white min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/50 backdrop-blur-md py-4 z-40">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-emerald-500">GO!</h1>
        <button 
          onClick={saveWorkout} 
          className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-transform"
        >
          FINALIZAR
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">¿Añadir ejercicio extra?</p>
        <ExerciseSearch onSelect={addNewExercise} />
      </div>

      {/* LISTA DE EJERCICIOS */}
      <div className="space-y-6">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-[2.5rem] relative group">
            {/* Botón Eliminar */}
            <button 
              onClick={() => removeExercise(ex.id)}
              className="absolute top-4 right-6 text-slate-700 hover:text-red-500 font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
               {ex.gifUrl && (
                 <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden p-1 shadow-lg shadow-black">
                    <img src={ex.gifUrl} className="w-full h-full object-contain" alt="" />
                 </div>
               )}
               <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black uppercase italic leading-tight pr-6 break-words">{ex.name}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">{ex.target} • {ex.bodyPart}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 focus-within:border-emerald-500/50 transition-colors">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Peso kg</span>
                <input 
                  type="number" 
                  inputMode="decimal"
                  placeholder="0"
                  value={formValues[ex.id]?.weight || ''}
                  className="bg-transparent w-full text-3xl font-black outline-none text-emerald-500 placeholder:text-slate-800"
                  onChange={(e) => setFormValues({
                    ...formValues, 
                    [ex.id]: {...formValues[ex.id], weight: e.target.value}
                  })}
                />
              </div>
              <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 focus-within:border-emerald-500/50 transition-colors">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Reps</span>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="0"
                  value={formValues[ex.id]?.reps || ''}
                  className="bg-transparent w-full text-3xl font-black outline-none text-emerald-500 placeholder:text-slate-800"
                  onChange={(e) => setFormValues({
                    ...formValues, 
                    [ex.id]: {...formValues[ex.id], reps: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-[3rem]">
            <p className="font-black italic text-2xl text-slate-800 leading-none uppercase">
              Tu sesión está vacía<br/>
              <span className="text-sm text-slate-700 not-italic font-bold">Usa el buscador para empezar</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
