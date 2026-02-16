'use client';
import { useState } from 'react';

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
      <input
        type="text"
        placeholder="Buscar ejercicio o músculo..."
        className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Miniatura del GIF */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={exercise.gif_url} 
                alt={exercise.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Información */}
            <div className="ml-4">
              <h3 className="font-bold text-gray-900 capitalize">{exercise.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full capitalize">
                  {exercise.target}
                </span>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                  {exercise.equipment}
                </span>
              </div>
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
