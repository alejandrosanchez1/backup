"use client"

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  ReactNode 
} from 'react';


export interface WorkoutSet {
  id: string;
  weight: string | number;
  reps: string | number;
  completed: boolean;     // <--- ASEGÚRATE DE QUE SE LLAME ASÍ
  previous?: string;
}

export interface WorkoutExercise {
  id: string
  name: string
  category: string
  sets: WorkoutSet[]
  notes?: string
  restTimer?: number
}

export interface Workout {
  id: string
  name: string
  startTime: Date
  exercises: WorkoutExercise[]
}

interface WorkoutContextType {
  currentWorkout: Workout | null
  isResting: boolean; // 
  setIsResting: (val: boolean) => void; // 
  restTimer: number; // 
  setRestTimer: (val: number) => void; // 
  startWorkout: (name?: string) => void
  endWorkout: () => void
  addExercise: (exercise: Omit<WorkoutExercise, "id" | "sets">) => void
  removeExercise: (exerciseId: string) => void
  addSet: (exerciseId: string) => void
  removeSet: (exerciseId: string, setId: string) => void
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void
  toggleSetComplete: (exerciseId: string, setId: string) => void
}

const WorkoutContext = createContext<WorkoutContextType | null>(null)

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null)

  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer <= 0 && isResting) {
      setIsResting(false);
    }

    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const startWorkout = useCallback((name = "New Workout") => {
    setCurrentWorkout({
      id: crypto.randomUUID(),
      name,
      startTime: new Date(),
      exercises: [],
    })
  }, [])

  const endWorkout = useCallback(() => {
    setCurrentWorkout(null)
  }, [])

  const addExercise = useCallback((exercise: Omit<WorkoutExercise, "id" | "sets">) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            ...exercise,
            id: crypto.randomUUID(),
            sets: [{ id: crypto.randomUUID(), weight: 0, reps: 0, completed: false }],
          },
        ],
      }
    })
  }, [])

  const removeExercise = useCallback((exerciseId: string) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.filter((e) => e.id !== exerciseId),
      }
    })
  }, [])

  const addSet = useCallback((exerciseId: string) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: [...e.sets, { id: crypto.randomUUID(), weight: 0, reps: 0, completed: false }],
              }
            : e,
        ),
      }
    })
  }, [])

  const removeSet = useCallback((exerciseId: string, setId: string) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.filter((s) => s.id !== setId),
              }
            : e,
        ),
      }
    })
  }, [])

  // ✅ CORRECCIÓN: La función ahora usa 'setCurrentWorkout' y busca por 'setId'
  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => 
                s.id === setId ? { ...s, ...updates } : s
              ),
            }
          }
          return ex
        }),
      }
    })
  }, [])

  const toggleSetComplete = useCallback((exerciseId: string, setId: string) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null;
      
      let shouldStartRest = false;
  
      const updatedExercises = prev.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                const newStatus = !s.completed;
                // 🔔 Si el set pasa a estar completado, activamos el descanso
                if (newStatus === true) {
                  shouldStartRest = true;
                }
                return { ...s, completed: newStatus };
              }
              return s;
            }),
          };
        }
        return ex;
      });
  
      // 🚀 SI SE COMPLETÓ EL SET, ACTIVAMOS LOS ESTADOS
      if (shouldStartRest) {
        setRestTimer(90); // O el tiempo que prefieras
        setIsResting(true);
      }
  
      return { ...prev, exercises: updatedExercises };
    });
  }, []);
  

  return (
    <WorkoutContext.Provider
      value={{
        currentWorkout,
        startWorkout,
        endWorkout,
        addExercise,
        removeExercise,
        addSet,
        removeSet,
        updateSet,
        toggleSetComplete,
        isResting,
        setIsResting,
        restTimer,
        setRestTimer
      }}
    >
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider")
  }
  return context
}

