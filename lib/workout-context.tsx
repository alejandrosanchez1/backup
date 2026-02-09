"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  completed: boolean
  previous?: string
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

  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
              }
            : e,
        ),
      }
    })
  }, [])

  const toggleSetComplete = useCallback((exerciseId: string, setId: string) => {
    setCurrentWorkout((prev) => {
      if (!prev) return null
      return {
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
              }
            : e,
        ),
      }
    })
  }, [])

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
