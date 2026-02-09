import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function ClientDashboard() {
  const supabase = await createClient();
  
  // 1. Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Traemos solo las rutinas asignadas a este usuario
  const { data: routines } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Mis Rutinas</h1>
        <p className="text-gray-500">Selecciona un entrenamiento para hoy</p>
      </header>

      <div className="space-y-4">
        {routines?.map((routine) => (
          <Link href={`/workout/${routine.id}`} key={routine.id}>
            <div className="p-5 bg-white border-2 border-gray-100 rounded-2xl shadow-sm hover:border-blue-500 transition-all active:scale-95 mb-4 block">
              <h2 className="text-lg font-bold text-gray-800">{routine.name}</h2>
              <p className="text-sm text-gray-400 mt-1">
                Asignada el {new Date(routine.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}

        {routines?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-dashed border-2">
            <p className="text-gray-500">Aún no tienes rutinas asignadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
