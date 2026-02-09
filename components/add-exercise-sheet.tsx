"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { exercisesData, categories, type ExerciseData } from "@/lib/exercises-data"
import { cn } from "@/lib/utils"

interface AddExerciseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectExercise: (exercise: ExerciseData) => void
}

export function AddExerciseSheet({ open, onOpenChange, onSelectExercise }: AddExerciseSheetProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredExercises = exercisesData.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelect = (exercise: ExerciseData) => {
    onSelectExercise(exercise)
    onOpenChange(false)
    setSearch("")
    setSelectedCategory("All")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] bg-background border-border rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground">Add Exercise</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "shrink-0",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollArea className="h-[calc(85vh-200px)]">
            <div className="space-y-1">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelect(exercise)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-foreground">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.muscle} • {exercise.equipment}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
