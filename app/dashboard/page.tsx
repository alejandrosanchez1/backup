'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientDashboard() {
  const [routines, setRoutines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Inicializamos el cliente de Supabase

  useEffect(() => {
    async function fetchRoutines() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('routines')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        setRoutines(data || [])
      }
      setLoading(false)
    }

    fetchRoutines()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-white">Cargando tus rutinas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold">Mis Rutinas</h1>
          <p className="text-slate-400">Selecciona un entrenamiento para hoy</p>
        </header>

        <div className="space-y-4">
          {routines.map((routine) => (
            <Link href={`/workout/${routine.id}`} key={routine.id} className="block">
              <div className="p-5 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-sm hover:border-blue-500 transition-all active:scale-95 mb-4">
                <h2 className="text-lg font-bold text-white">{routine.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Asignada el {new Date(routine.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}

          {routines.length === 0 && (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border-dashed border-2 border-slate-800">
              <p className="text-slate-500">Aún no tienes rutinas asignadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
