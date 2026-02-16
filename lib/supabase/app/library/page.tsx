"use client"; // 👈 Fundamental para que funcione en el móvil

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Definimos la interfaz para tener autocompletado y evitar errores
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
}

export default function LibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase.from('exercises').select('*');
      
      if (error) {
        console.error('Error cargando ejercicios:', error);
      } else {
        setExercises(data || []);
      }
      setLoading(false);
    }

    fetchExercises();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Cargando ejercicios...</div>;
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Librería de Ejercicios</h1>
      <div className="grid gap-3">
        {exercises.length > 0 ? (
          exercises.map(ex => (
            <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{ex.name}</h3>
                <p className="text-slate-500 text-xs uppercase">{ex.muscle_group} • {ex.equipment}</p>
              </div>
              <span className="text-blue-500 text-xl">+</span>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No se encontraron ejercicios.</p>
        )}
      </div>
    </div>
  );
}
