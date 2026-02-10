'use server'

declare const process: {
  env: {
    RAPIDAPI_KEY?: string
    RAPIDAPI_HOST?: string
  }
}

export async function generateRoutine(userGoal: string, fitnessLevel: string) {
  try {
    // MOCK: simular tiempo de "pensamiento" de la IA
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // --- Código real para producción (RapidAPI) - comentado para evitar 429 ---
    // const apiKey = process.env.RAPIDAPI_KEY
    // const apiHost = process.env.RAPIDAPI_HOST || 'ai-workout-planner-exercise-fitness-nutrition-guide.p.rapidapi.com'
    //
    // if (!apiKey) {
    //   throw new Error('RAPIDAPI_KEY no está configurada en las variables de entorno. Añade RAPIDAPI_KEY en tu archivo .env.local')
    // }
    //
    // const response = await fetch('https://exercisedbv2.ascendapi.com/api/v1', {
    //   method: 'POST',
    //   headers: {
    //     'X-RapidAPI-Key': apiKey,
    //     'X-RapidAPI-Host': apiHost,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     goal: userGoal,
    //     level: fitnessLevel,
    //   }),
    // })
    //
    // if (!response.ok) {
    //   const errorText = await response.text()
    //   throw new Error(`Error de la API: ${response.status} - ${errorText}`)
    // }
    //
    // const data = await response.json()

    const mockRoutine = [
      {
        day: 'Lunes (Pecho)',
        description: 'Rutina de Fuerza Espartana',
        exercises: [
          { name: 'Press Banca', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Press Inclinado con Mancuernas', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Aperturas', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: 'Miércoles (Espalda)',
        exercises: [
          { name: 'Dominadas', sets: 4, reps: '6-10', rest: '90s' },
          { name: 'Remo con Barra', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Face Pull', sets: 3, reps: '12-15', rest: '60s' },
        ],
      },
      {
        day: 'Viernes (Pierna)',
        exercises: [
          { name: 'Sentadillas', sets: 4, reps: '8-10', rest: '120s' },
          { name: 'Peso Muerto Rumano', sets: 3, reps: '10-12', rest: '90s' },
          { name: 'Zancadas', sets: 3, reps: '10 por pierna', rest: '60s' },
        ],
      },
    ]

    return { success: true, data: mockRoutine }
  } catch (error) {
    console.error('Error al generar rutina:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar la rutina',
    }
  }
}

