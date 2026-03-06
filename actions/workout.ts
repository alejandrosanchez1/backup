'use server'

// Definimos la interfaz para que Cursor sepa qué devuelve la IA
export interface RoutineDay {
  day: string;
  description?: string;
  exercises: { name: string; sets: number; reps: string; rest: string }[];
}

export async function generateRoutine(userGoal: string, fitnessLevel: string) {
  try {
    // Simulación de delay para feedback visual (Skeleton)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockRoutine: RoutineDay[] = [
      {
        day: 'Lunes (Pecho)',
        description: 'Enfoque en fuerza explosiva',
        exercises: [
          { name: 'Press Banca', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Aperturas', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      // ... más días
    ];

    return { success: true, data: mockRoutine };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error en la IA' 
    };
  }
}
