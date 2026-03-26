'use client';
import { useState } from 'react';
import { ChevronRight, Search, X, Loader2 } from 'lucide-react';

interface ExerciseListProps {
  initialExercises: any[];
  bodyParts?: string[];
  equipments?: string[];
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
}

export default function ExerciseList({ 
  initialExercises, 
  bodyParts = [], 
  equipments = [],
  onLoadMore,
  hasMore = false,
  loading = false
}: ExerciseListProps) {
  const [search, setSearch] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  const filteredExercises = initialExercises.filter((ex) => {
    const name = ex.name || '';
    const target = ex.target || ex.targetMuscles?.[0] || '';
    const bodyPart = ex.bodyPart || ex.bodyParts?.[0] || '';
    const equipment = ex.equipment || ex.equipments?.[0] || '';
    
    const matchesSearch = !search || 
      name.toLowerCase().includes(search.toLowerCase()) ||
      target.toLowerCase().includes(search.toLowerCase());
    
    const matchesBodyPart = !selectedBodyPart || 
      bodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
    
    const matchesEquipment = !selectedEquipment || 
      equipment.toLowerCase() === selectedEquipment.toLowerCase();
    
    return matchesSearch && matchesBodyPart && matchesEquipment;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedBodyPart('');
    setSelectedEquipment('');
  };

  const hasFilters = search || selectedBodyPart || selectedEquipment;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="px-4 space-y-3">
        <input
          type="text"
          placeholder="Buscar ejercicio o músculo..."
          value={search}
          className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <select
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value)}
            className="p-2 rounded-lg border border-gray-200 bg-white text-sm text-slate-900 whitespace-nowrap"
          >
            <option value="">Todos los músculos</option>
            {bodyParts.map((bp) => (
              <option key={bp} value={bp}>{bp}</option>
            ))}
          </select>
          
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="p-2 rounded-lg border border-gray-200 bg-white text-sm text-slate-900 whitespace-nowrap"
          >
            <option value="">Todos los equipos</option>
            {equipments.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
          
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-lg bg-red-100 text-red-600 text-sm whitespace-nowrap flex items-center gap-1"
            >
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-20">
        {filteredExercises.map((exercise) => (
          <div 
            key={exercise.exerciseId} 
            className="flex items-center p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-sm"
          >
            {/* Miniatura del GIF */}
            <div className="w-16 h-16 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 border border-slate-600 flex items-center justify-center">
              {(exercise.gifUrl || exercise.gif_url) ? (
                <img
                  src={exercise.gifUrl || exercise.gif_url}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`text-slate-400 text-xs text-center px-1 ${(exercise.gifUrl || exercise.gif_url) ? 'hidden' : ''}`}>
                {exercise.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Información del Ejercicio */}
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-white text-sm capitalize">
                {exercise.name}
              </h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                {exercise.target || exercise.targetMuscles?.[0]}
              </p>
              {(exercise.equipment || exercise.equipments?.[0]) && (
                <p className="text-slate-500 text-[9px] mt-0.5">
                  {exercise.equipment || exercise.equipments?.[0]}
                </p>
              )}
            </div>
            
            {/* Icono de flecha */}
            <div className="text-slate-500 pr-2">
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No se encontraron ejercicios.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-500 hover:underline text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Botón cargar más */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pb-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Cargando...
              </>
            ) : (
              'Cargar más ejercicios'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
