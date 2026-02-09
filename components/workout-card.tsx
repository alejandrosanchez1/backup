import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, Clock, Weight, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Exercise {
  name: string
  sets: number
  icon?: string
}

interface WorkoutCardProps {
  user: {
    name: string
    avatar: string
    initials: string
  }
  workout: {
    title: string
    emoji?: string
    duration: string
    volume: string
    sets: number
    exercises: Exercise[]
    timeAgo: string
  }
  likes: number
  comments: number
}

export function WorkoutCard({ user, workout, likes, comments }: WorkoutCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={workout.exercises[0]?.icon || "/placeholder.svg?height=40&width=40&query=avatar"} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{workout.timeAgo}</span>
            </div>
            <h3 className="font-bold text-lg text-foreground">
              {workout.title} {workout.emoji}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{workout.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Weight className="h-4 w-4" />
                <span>{workout.volume}</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{workout.sets}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Workout</p>
          <div className="space-y-2">
            {workout.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-primary">●</span>
                <span className="text-foreground">
                  {exercise.sets} sets {exercise.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span className="text-primary">❤️</span>
            <span>{likes} likes</span>
            <span className="mx-2">•</span>
            <span>{comments} comments</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
