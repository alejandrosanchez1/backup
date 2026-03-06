"use client"
import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RoutinesPage() {
  const [routines, setRoutines] = useState([])

  useEffect(() => {
    const fetchRoutines = async () => {
  try {
    // 1. Consultamos la tabla 'routines' de Supabase
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Guardamos las rutinas en el estado para que se vean en la Home
    setRoutines(data || []);
  } catch (error: any) {
    console.error('Error cargando rutinas:', error.message);
  }
};
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Mis Rutinas</h1>
          <p className="text-slate-400 text-sm">Gestiona tus planes de entrenamiento</p>
        </div>
        {/* Botón para ir a crear rutina */}
        <Link href="/routines/create" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </Link>
      </div>

      <div className="space-y-4">
        {routines && routines.length > 0 ? (
          routines.map((routine) => (
            <div key={routine.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {routine.name}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {routine.notes || 'Sin notas'}
                  </p>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-lg">
                  {routine.routine_exercises?.[0]?.count || 0} Ejercicios
                </span>
              </div>
              
              {/* Botón que envía el ID de la rutina a la página de workout */}
              <Link href={`/workout?routineId=${routine.id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
                  Empezar Entrenamiento
                </button>
              </Link>
            </div>
          ))
        ) : (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">No tienes rutinas creadas</p>
            <Link href="/routines/create" className="text-blue-400 text-sm font-bold">Crear mi primera rutina</Link>
          </div>
        )}
      </div>
    </div>
  )
}
