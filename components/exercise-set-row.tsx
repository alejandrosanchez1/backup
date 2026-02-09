"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkoutSet } from "@/lib/workout-context"

interface ExerciseSetRowProps {
  set: WorkoutSet
  index: number
  onUpdate: (updates: Partial<WorkoutSet>) => void
  onToggleComplete: () => void
  onRemove: () => void
  showRemove: boolean
}

export function ExerciseSetRow({ set, index, onUpdate, onToggleComplete, onRemove, showRemove }: ExerciseSetRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_80px_80px_48px] items-center gap-2 py-2 px-2 rounded-lg transition-colors",
        set.completed ? "bg-primary/20" : "bg-secondary/50",
      )}
    >
      <div className="flex items-center justify-center">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
            set.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {index + 1}
        </span>
      </div>
      <div className="text-sm text-muted-foreground truncate">{set.previous || "—"}</div>
      <Input
        type="number"
        placeholder="kg"
        value={set.weight || ""}
        onChange={(e) => onUpdate({ weight: Number(e.target.value) })}
        className="h-9 text-center bg-input border-0 text-foreground"
      />
      <Input
        type="number"
        placeholder="reps"
        value={set.reps || ""}
        onChange={(e) => onUpdate({ reps: Number(e.target.value) })}
        className="h-9 text-center bg-input border-0 text-foreground"
      />
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md transition-colors",
            set.completed
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
          onClick={onToggleComplete}
        >
          <Check className="h-4 w-4" />
        </Button>
        {showRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/20"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
