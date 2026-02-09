import { Card, CardContent } from "@/components/ui/card"
import { Clock, Weight, Layers, ChevronRight } from "lucide-react"

interface WorkoutHistoryItemProps {
  title: string
  date: string
  duration: string
  volume: string
  sets: number
  exercises: number
}

export function WorkoutHistoryItem({ title, date, duration, volume, sets, exercises }: WorkoutHistoryItemProps) {
  return (
    <Card className="bg-card border-border cursor-pointer hover:bg-secondary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{date}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Weight className="h-3.5 w-3.5" />
                <span>{volume}</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                <span>{sets} sets</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
