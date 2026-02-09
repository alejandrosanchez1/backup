"use client"

import { useEffect, useState } from "react"

interface WorkoutTimerProps {
  startTime: Date
}

export function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState("0:00")

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000)
      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      if (hours > 0) {
        setElapsed(`${hours}h ${minutes}m`)
      } else {
        setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return <span className="font-mono text-sm text-muted-foreground">{elapsed}</span>
}
