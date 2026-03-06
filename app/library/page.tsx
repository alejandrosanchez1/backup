'use client'

import { useState } from 'react'
import { ExerciseSearch } from '@/components/ExerciseSearch'
import { Plus, Dumbbell } from 'lucide-react'

export default function LibraryPage() {
  // Estado para guardar los ejercicios que vamos buscando y añadiendo a la vista
  const [selectedExercises, setSelectedExercises] = useState<any[]>([])

  const handleAdd = (exercise: any) => {
    // Evitamos duplicados en la lista visual
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises([exercise, ...selectedExercises])
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32">
      {/* HEADER: Título y Botón de Crear */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Librería
        </h1>
        <button className="bg-emerald-500 text-black text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Plus size={14} strokeWidth={4} />
          Crear Ejercicio
        </button>
      </div>

      {/* BUSCADOR: Aquí inyectamos tu componente ExerciseSearch */}
      <div className="relative mb-10">
        <ExerciseSearch onSelect={handleAdd} />
      </div>

      {/* LISTA DE RESULTADOS / EXPLORACIÓN */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-4">
          {selectedExercises.length > 0 ? 'Resultados recientes' : 'Busca un ejercicio para explorar'}
        </p>

        <div className="grid gap-4">
          {selectedExercises.map((ex) => (
            <div 
              key={ex.id} 
              className="bg-slate-900/50 p-4 rounded-[2rem] border border-slate-800/50 flex items-center gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Miniatura del Ejercicio */}
              <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex-shrink-0 p-1 shadow-lg">
                <img 
                  src={ex.gifUrl} 
                  className="w-full h-full object-contain" 
                  alt={ex.name}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Información */}
              <div className="flex-1">
                <h3 className="font-black uppercase italic text-base leading-tight">
                  {ex.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                    {ex.bodyPart}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                    {ex.target}
                  </span>
                </div>
              </div>
              
              {/* Botón de info o acción extra */}
              <button className="text-slate-700 p-2">
                <Dumbbell size={18} />
              </button>
            </div>
          ))}

          {/* Estado vacío: Si no hay nada buscado aún */}
          {selectedExercises.length === 0 && (
            <div className="text-center py-20 opacity-10">
              <Dumbbell size={64} className="mx-auto mb-4" />
              <p className="font-black italic text-xl uppercase">Explora la base de datos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
