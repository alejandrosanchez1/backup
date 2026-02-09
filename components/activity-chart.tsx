"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const weekData = [
  { day: "Mon", workouts: 1, volume: 8500 },
  { day: "Tue", workouts: 0, volume: 0 },
  { day: "Wed", workouts: 1, volume: 12000 },
  { day: "Thu", workouts: 1, volume: 9200 },
  { day: "Fri", workouts: 0, volume: 0 },
  { day: "Sat", workouts: 1, volume: 15000 },
  { day: "Sun", workouts: 0, volume: 0 },
]

const maxVolume = Math.max(...weekData.map((d) => d.volume))

export function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekData.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex flex-col items-center justify-end h-24">
                <div
                  className={`w-full max-w-8 rounded-t-md transition-all ${
                    day.volume > 0 ? "bg-primary" : "bg-secondary"
                  }`}
                  style={{
                    height: day.volume > 0 ? `${(day.volume / maxVolume) * 100}%` : "8px",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
