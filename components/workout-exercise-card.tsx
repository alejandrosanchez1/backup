"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Timer, Dumbbell, CheckCircle2 } from "lucide-react"
import { ExerciseSetRow } from "./exercise-set-row"
import type { WorkoutExercise, WorkoutSet } from "@/lib/workout-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise
  onAddSet: () => void
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void
  onToggleSetComplete: (setId: string) => void
  onRemoveExercise: () => void
}

export function WorkoutExerciseCard({
  exercise,
  onAddSet,
  onUpdateSet,
  onToggleSetComplete,
  onRemoveExercise,
}: WorkoutExerciseCardProps) {
  
  // Cálculo de progreso para feedback visual
const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;
  const isAllDone = completedSets === totalSets && totalSets > 0;

  return (
    <Card className={cn(
      "bg-card border-border transition-all duration-300",
      isAllDone ? "border-green-500/30 shadow-sm shadow-green-500/5" : "hover:border-primary/20"
    )}>
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isAllDone ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary"
            )}>
              <Dumbbell size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none flex items-center gap-2">
                {exercise.name}
                {isAllDone && <CheckCircle2 size={14} className="text-green-500" />}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                {completedSets} de {totalSets} series completadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Timer className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* 🗑️ He borrado el DropdownMenuItem de "Eliminar Ejercicio" */}
                <DropdownMenuItem className="cursor-pointer">
                  Ver técnica / Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {exercise.notes && (
          <p className="text-xs text-muted-foreground/80 bg-accent/30 p-2 rounded mt-2 italic">
            "{exercise.notes}"
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Header de la tabla de series */}
        <div className="grid grid-cols-[35px_1fr_75px_75px_45px] items-center gap-2 mb-2 px-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
          <div className="text-center">SET</div>
          <div className="pl-1 text-left">PREV</div>
          <div className="text-center">KG</div>
          <div className="text-center">REPS</div>
          <div />
        </div>

        {/* Lista de Series */}
        <div className="space-y-1.5">
          {exercise?.sets?.map((set: any, idx: number) => (
            <ExerciseSetRow
              key={set.id || idx}
              set={set}
              index={idx}
              onUpdate={(updates) => onUpdateSet(set.id, updates)}
              onToggleComplete={() => onToggleSetComplete(set.id)}
              isSaving={false} // O la variable de estado que tengas
            />
          ))}
        </div>

        {/* Botón Añadir Serie */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all font-medium"
          onClick={onAddSet}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Serie
        </Button>
      </CardContent>
    </Card>
  )
}
