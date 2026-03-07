import { supabase } from '@/lib/supabase';

export const getExerciseProgress = async (userId: string, exerciseId: string) => {
  

  const { data, error } = await supabase
    .from('workout_sets')
    .select(`
      weight,
      reps,
      created_at,
      workout_logs!inner (
        user_id,
        name
      )
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_logs.user_id', userId) // Filtro de seguridad extra
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Procesamos los datos para la gráfica
  return data.map(set => ({
    fecha: new Date(set.created_at).toLocaleDateString(),
    peso: set.weight,
    reps: set.reps,
    // Fórmula de Brzycki para el 1RM Estimado: Peso / (1.0278 - (0.0278 * Reps))
    oneRepMax: Math.round(set.weight / (1.0278 - (0.0278 * set.reps)))
  }));
};
