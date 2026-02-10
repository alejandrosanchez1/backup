import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/stats-card"
import { ActivityChart } from "@/components/activity-chart"
import { WorkoutHistoryItem } from "@/components/workout-history-item"
import { Calendar, Dumbbell, Flame, Trophy, Settings, Share2, TrendingUp } from "lucide-react"

const workoutHistory = [
  {
    title: "Full Body Workout",
    date: "Today, 10:30 AM",
    duration: "1h 15m",
    volume: "9,250kg",
    sets: 34,
    exercises: 8,
  },
  {
    title: "Upper Body Push",
    date: "Yesterday",
    duration: "58m",
    volume: "7,800kg",
    sets: 22,
    exercises: 6,
  },
  {
    title: "Leg Day",
    date: "Dec 13, 2025",
    duration: "1h 30m",
    volume: "15,400kg",
    sets: 28,
    exercises: 7,
  },
  {
    title: "Back & Biceps",
    date: "Dec 11, 2025",
    duration: "1h 05m",
    volume: "8,900kg",
    sets: 26,
    exercises: 6,
  },
]

const personalRecords = [
  { exercise: "Bench Press", weight: "100kg", date: "Dec 10, 2025" },
  { exercise: "Squat", weight: "140kg", date: "Dec 8, 2025" },
  { exercise: "Deadlift", weight: "180kg", date: "Dec 5, 2025" },
  { exercise: "Overhead Press", weight: "65kg", date: "Dec 1, 2025" },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="px-4 py-4">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/fitness-avatar.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">John Doe</h1>
              <p className="text-sm text-muted-foreground">Member since Dec 2024</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard title="Total Workouts" value="48" subtitle="This month: 12" icon={Dumbbell} />
          <StatsCard title="Current Streak" value="5" subtitle="Best: 14 days" icon={Flame} />
          <StatsCard title="Total Volume" value="458K" subtitle="kg lifted" icon={TrendingUp} />
          <StatsCard title="PRs This Month" value="8" subtitle="4 this week" icon={Trophy} />
        </div>

        {/* Activity Chart */}
        <div className="mb-6">
          <ActivityChart />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full bg-secondary mb-4">
            <TabsTrigger
              value="history"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              History
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Records
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-0">
            <div className="space-y-3">
              {workoutHistory.map((workout, idx) => (
                <WorkoutHistoryItem key={idx} {...workout} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="records" className="mt-0">
            <div className="space-y-3">
              {personalRecords.map((record, idx) => (
                <Card key={idx} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.exercise}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-primary">{record.weight}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  December 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for first day offset */}
                  <div />
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1
                    const hasWorkout = [1, 3, 5, 8, 10, 11, 13, 14, 15].includes(day)
                    const isToday = day === 15
                    return (
                      <div
                        key={day}
                        className={`aspect-square flex items-center justify-center text-sm rounded-full ${
                          isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : hasWorkout
                              ? "bg-primary/20 text-primary"
                              : "text-foreground"
                        }`}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20" />
                    <span className="text-xs text-muted-foreground">Workout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <MobileNav />
    </div>
  )
}
