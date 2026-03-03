import { supabase } from '@/lib/supabase';

export const saveWorkoutSession = async (userId: string, workoutData: any) => {

  // 1. Insertamos la cabecera del entrenamiento (el Log)
  const { data: logData, error: logError } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      name: workoutData.name || 'Entrenamiento del día',
      duration_minutes: workoutData.duration,
      routine_id: workoutData.routineId || null,
    })
    .select()
    .single();

  if (logError) throw new Error(`Error al crear el log: ${logError.message}`);

  // 2. Preparamos los sets para insertarlos todos juntos (Bulk Insert)
  // workoutData.exercises es un array de ejercicios, cada uno con un array de sets
  const setsToInsert = workoutData.exercises.flatMap((exercise: any) => 
    exercise.sets.map((set: any) => ({
      log_id: logData.id, // El ID que acabamos de generar arriba
      exercise_id: exercise.id,
      weight: set.weight,
      reps: set.reps,
      is_pr: set.isPr || false
    }))
  );

  // 3. Insertamos todos los sets de golpe
  const { error: setsError } = await supabase
    .from('workout_sets')
    .insert(setsToInsert);

  if (setsError) {
    // Si fallan los sets, podrías querer borrar el log para no dejar datos huérfanos
    await supabase.from('workout_logs').delete().eq('id', logData.id);
    throw new Error(`Error al guardar las series: ${setsError.message}`);
  }

  return { success: true, logId: logData.id };
};
