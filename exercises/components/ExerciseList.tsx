'use client';
import { useState } from 'react';
// 1. IMPORTANTE: Añadir la importación de ChevronRight
import { ChevronRight } from 'lucide-react';

export default function ExerciseList({ initialExercises }: { initialExercises: any[] }) {
  const [search, setSearch] = useState('');

  // Filtrado en tiempo real
  const filteredExercises = initialExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="px-4">
        <input
          type="text"
          placeholder="Buscar ejercicio o músculo..."
          value={search} // Añadido para control del estado
          className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-20">
        {filteredExercises.map((exercise) => (
          <div 
            key={exercise.id} 
            className="flex items-center p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-sm hover:bg-slate-800/60 transition-all"
          >
            {/* Miniatura del GIF */}
            <div className="w-16 h-16 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 border border-slate-600">
              <img 
                src={exercise.gif_url} 
                alt={exercise.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Información del Ejercicio */}
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-white text-sm capitalize">
                {exercise.name}
              </h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                {exercise.target}
              </p>
            </div>
            
            {/* Icono de flecha (Ahora ya funcionará) */}
            <div className="text-slate-500 pr-2">
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <p className="text-center text-gray-500 py-10">No se encontraron ejercicios.</p>
      )}
    </div>
  );
}
