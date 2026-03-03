"use client"

import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Usamos un tipo más flexible para evitar errores de interfaz
interface ExerciseSetRowProps {
  set: any; 
  index: number;
  onUpdate: (updates: any) => void;
  onToggleComplete: () => void;
  isSaving?: boolean;
}

export function ExerciseSetRow({
  set,
  index,
  onUpdate,
  onToggleComplete,
  isSaving = false,
}: ExerciseSetRowProps) {
  
  const isDone = set.completed;

  const handleInputChange = (field: 'weight' | 'reps', value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    onUpdate({ [field]: cleanValue });
  };

  return (
    <div className={cn(
      "grid grid-cols-[35px_1fr_75px_75px_45px] items-center gap-2 p-1.5 rounded-lg transition-all duration-200",
      isDone ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-slate-800/40 border border-transparent"
    )}>
      
      <div className="flex justify-center">
        <span className={cn(
          "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border",
          isDone ? "bg-emerald-500 text-white border-emerald-500" : "text-slate-500 border-slate-700"
        )}>
          {index + 1}
        </span>
      </div>

      <div className="text-[10px] text-slate-500 italic truncate px-1">
        {set.previous || "—"}
      </div>

      <Input
        type="number"
        placeholder="0"
        value={set.weight || ""}
        disabled={isDone}
        onChange={(e) => handleInputChange('weight', e.target.value)}
        className={cn("h-9 text-center bg-slate-900 border-slate-700 text-white", isDone && "opacity-50")}
      />

      <Input
        type="number"
        placeholder="0"
        value={set.reps || ""}
        disabled={isDone}
        onChange={(e) => handleInputChange('reps', e.target.value)}
        className={cn("h-9 text-center bg-slate-900 border-slate-700 text-white", isDone && "opacity-50")}
      />

      <div className="flex justify-center items-center">
        {isSaving ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500/50" />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", isDone ? "text-emerald-400" : "text-slate-500")}
            onClick={onToggleComplete}
          >
            <Check className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
