import { createClient } from '@/lib/supabase/server';
import ExerciseList from './components/ExerciseList';

export default async function ExercisesPage() {
  const supabase = await createClient();

  // Traemos los ejercicios (tanto los globales como los del usuario)
  const { data: exercises, error } = await supabase
    .from('custom_exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) return <div>Error cargando ejercicios...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Ejercicios</h1>
        <p className="text-gray-500">Explora la biblioteca de movimientos</p>
      </header>

      {/* Pasamos los datos al componente de cliente para filtrar */}
      <ExerciseList initialExercises={exercises || []} />
    </div>
  );
}
