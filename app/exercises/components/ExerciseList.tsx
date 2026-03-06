'use client';
import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

export default function ExerciseList({ initialExercises }: { initialExercises: any[] }) {
  const [search, setSearch] = useState('');

  const filteredExercises = initialExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda estilizada para modo oscuro */}
      <div className="relative px-4">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar ejercicio o músculo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 pl-12 rounded-2xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
        />
      </div>

      {/* Listado de ejercicios */}
      {filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-slate-500 font-medium">No se encontraron ejercicios.</p>
          <button 
            onClick={() => setSearch('')}
            className="mt-2 text-emerald-400 text-sm hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-24">
          {filteredExercises.map((exercise) => (
            <div 
              key={exercise.id} 
              className="group flex items-center p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
              {/* Miniatura del GIF */}
              <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                <img 
                  src={exercise.gif_url} 
                  alt={exercise.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>

              {/* Información del Ejercicio */}
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-white text-sm capitalize leading-tight">
                  {exercise.name}
                </h3>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                  {exercise.target}
                </p>
              </div>

              {/* Icono de flecha */}
              <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 mr-2 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
