import { supabase } from '@/lib/supabase';

export const getWorkoutHistory = async (userId: string) => {


  const { data, error } = await supabase
    .from('workout_logs')
    .select(`
      id,
      name,
      duration_minutes,
      created_at,
      workout_sets (
        id,
        weight,
        reps,
        is_pr,
        exercise_id,
        exercises (
          name,
          muscle_group
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Los más recientes primero

  if (error) throw new Error(`Error al obtener historial: ${error.message}`);

  return data;
};
