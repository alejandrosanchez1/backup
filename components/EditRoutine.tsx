'use client'
import { useState } from 'react'
import { ExerciseSearch } from './ExerciseSearch' 

export default function EditRoutine() {
  // ESTADO: Aquí guardamos los ejercicios que el usuario va eligiendo
  const [routineExercises, setRoutineExercises] = useState<any[]>([])

  // FUNCIÓN: Se ejecuta cuando haces clic en un ejercicio del buscador
  const handleAddExercise = (exercise: any) => {
    console.log("Ejercicio recibido del buscador:", exercise);
    
    // Creamos el nuevo objeto para la lista
    const newEntry = {
      ...exercise,
      id_temp: Math.random().toString(36).substr(2, 9), // ID único para la lista
      sets: [] // Estructura para las series futuras
    };

    // Actualizamos el estado SIN borrar lo anterior
    setRoutineExercises(prev => [...prev, newEntry]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-xl font-black uppercase italic">Editar Rutina</h1>
        <button className="bg-emerald-500 text-black px-6 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
          Listo
        </button>
      </div>

      {/* BUSCADOR: Le pasamos la función handleAddExercise */}
      <div className="mb-6 relative z-50">
        <ExerciseSearch onSelect={handleAddExercise} />
      </div>

      {/* LISTA DE EJERCICIOS AÑADIDOS */}
      <div className="space-y-3">
        {routineExercises.length === 0 ? (
          <div className="text-center py-10 border border-slate-800/50 rounded-[2rem] bg-slate-900/20">
            <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.2em]">
              Busca ejercicios para añadir
            </p>
          </div>
        ) : (
          routineExercises.map((ex) => (
            <div 
              key={ex.id_temp} 
              className="flex items-center gap-4 bg-[#1e293b]/40 p-3 rounded-[1.5rem] border border-slate-800/50"
            >
              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden p-1">
                <img src={ex.gifUrl} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-xs uppercase italic">{ex.name}</p>
                <p className="text-emerald-500 text-[9px] font-bold uppercase">{ex.target}</p>
              </div>
              <button 
                onClick={() => setRoutineExercises(prev => prev.filter(i => i.id_temp !== ex.id_temp))}
                className="bg-red-500/10 text-red-500 p-2 rounded-lg text-[10px] font-bold"
              >
                BORRAR
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
