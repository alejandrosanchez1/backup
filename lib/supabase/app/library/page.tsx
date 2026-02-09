import { supabase } from '@/lib/supabase'

export default async function LibraryPage() {
  const { data: exercises } = await supabase.from('exercises').select('*')

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Librería de Ejercicios</h1>
      <div className="grid gap-3">
        {exercises?.map(ex => (
          <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">{ex.name}</h3>
              <p className="text-slate-500 text-xs uppercase">{ex.muscle_group} • {ex.equipment}</p>
            </div>
            <span className="text-blue-500 text-xl">+</span>
          </div>
        ))}
      </div>
    </div>
  )
}
