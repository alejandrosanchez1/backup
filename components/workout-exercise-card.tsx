"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Timer } from "lucide-react"
import { ExerciseSetRow } from "@/components/exercise-set-row"
import type { WorkoutExercise, WorkoutSet } from "@/lib/workout-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void
  onToggleSetComplete: (setId: string) => void
  onRemoveExercise: () => void
}

export function WorkoutExerciseCard({
  exercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSetComplete,
  onRemoveExercise,
}: WorkoutExerciseCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary">{exercise.name}</h3>
            {exercise.notes && <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Timer className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onRemoveExercise}>
                  Remove Exercise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[40px_1fr_80px_80px_48px] items-center gap-2 mb-2 px-2 text-xs text-muted-foreground font-medium">
          <div className="text-center">SET</div>
          <div>PREVIOUS</div>
          <div className="text-center">KG</div>
          <div className="text-center">REPS</div>
          <div />
        </div>
        <div className="space-y-2">
          {exercise.sets.map((set, idx) => (
            <ExerciseSetRow
              key={set.id}
              set={set}
              index={idx}
              onUpdate={(updates) => onUpdateSet(set.id, updates)}
              onToggleComplete={() => onToggleSetComplete(set.id)}
              onRemove={() => onRemoveSet(set.id)}
              showRemove={exercise.sets.length > 1}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-3 text-primary hover:text-primary hover:bg-primary/10"
          onClick={onAddSet}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  )
}
