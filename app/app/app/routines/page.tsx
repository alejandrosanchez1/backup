import { supabase } from '@/lib/supabase' // Asegúrate de que la ruta sea correcta

export default async function RoutinesPage() {
  // 1. Obtenemos las rutinas de la base de datos
  const { data: routines, error } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: false })
 // ESTO APARECERÁ EN TU TERMINAL DE CURSOR (abajo)
 console.log("Datos de Supabase:", routines)
 console.log("Error de Supabase:", error)

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mis Rutinas</h1>
          <p className="text-slate-400 text-sm">Gestiona tus planes de entrenamiento</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white p-3 rounded-full shadow-lg shadow-blue-900/30 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      {/* Lista de Rutinas Dinámica */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl text-red-400 text-sm">
            Error al conectar con Supabase: {error.message}
          </div>
        )}

        {/* Mapeo de Rutinas Reales */}
        {routines && routines.length > 0 ? (
          routines.map((routine) => (
            <div key={routine.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                    {routine.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {routine.last_performed ? `Última vez: ${routine.last_performed}` : 'Sin entrenar aún'}
                  </p>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-lg">
                  {routine.exercise_count || 0} Ejercicios
                </span>
              </div>
              
              {/* Barra de progreso visual (estética) */}
              <div className="flex gap-2 mb-6">
                <div className="h-1 flex-1 bg-blue-600 rounded-full"></div>
                <div className="h-1 flex-1 bg-blue-600/40 rounded-full"></div>
                <div className="h-1 flex-1 bg-slate-700 rounded-full"></div>
              </div>

              <button className="w-full bg-slate-800 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all">
                Empezar Entrenamiento
              </button>
            </div>
          ))
        ) : (
          /* Card de Ejemplo vacío (Solo se muestra si no hay datos) */
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <span className="text-slate-500 text-2xl">📋</span>
            </div>
            <p className="text-slate-400 font-medium">No tienes rutinas creadas</p>
            <button className="mt-2 text-blue-400 text-sm font-bold hover:text-blue-300">
              Crear mi primera rutina
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas Rápidas (Podemos hacerlas dinámicas luego) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Entrenamientos</p>
          <p className="text-2xl font-black mt-1">{routines?.length || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Estado</p>
          <p className="text-2xl font-black mt-1 text-green-500">Activo</p>
        </div>
      </div>
    </div>
  )
}
