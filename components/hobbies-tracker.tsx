"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface Hobby {
  id: string
  name: string
  progress: number
  date: string
}

interface HobbiesTrackerProps {
  date: Date
}

export function HobbiesTracker({ date }: HobbiesTrackerProps) {
  const [hobbies, setHobbies] = useState<Hobby[]>(() => {
    // Load hobbies from localStorage if available
    if (typeof window !== "undefined") {
      const savedHobbies = localStorage.getItem("dashboard-hobbies")
      return savedHobbies ? JSON.parse(savedHobbies) : []
    }
    return []
  })

  const [isAddHobbyOpen, setIsAddHobbyOpen] = useState(false)
  const [newHobbyName, setNewHobbyName] = useState("")
  const [newHobbyProgress, setNewHobbyProgress] = useState(0)

  // Save hobbies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard-hobbies", JSON.stringify(hobbies))
  }, [hobbies])

  const todayHobbies = hobbies.filter(
    (hobby) => format(new Date(hobby.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
  )

  const addHobby = () => {
    if (!newHobbyName.trim()) return

    const newHobby: Hobby = {
      id: crypto.randomUUID(),
      name: newHobbyName,
      progress: newHobbyProgress,
      date: format(date, "yyyy-MM-dd"),
    }

    setHobbies([...hobbies, newHobby])
    setNewHobbyName("")
    setNewHobbyProgress(0)
    setIsAddHobbyOpen(false)
  }

  const updateHobbyProgress = (id: string, progress: number) => {
    setHobbies(hobbies.map((hobby) => (hobby.id === id ? { ...hobby, progress } : hobby)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Hobbies</h2>
        <Button onClick={() => setIsAddHobbyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hobby
        </Button>
      </div>

      {todayHobbies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">No hobbies tracked for today</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddHobbyOpen(true)}>
              Add Your First Hobby
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todayHobbies.map((hobby) => (
            <Card key={hobby.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{hobby.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="font-medium">{hobby.progress}%</span>
                  </div>
                  <Progress value={hobby.progress} className="h-2" />
                  <Slider
                    value={[hobby.progress]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => updateHobbyProgress(hobby.id, value[0])}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddHobbyOpen} onOpenChange={setIsAddHobbyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Hobby</DialogTitle>
            <DialogDescription>Track a new hobby for {format(date, "MMMM d, yyyy")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hobby-name">Hobby Name</Label>
              <Input
                id="hobby-name"
                value={newHobbyName}
                onChange={(e) => setNewHobbyName(e.target.value)}
                placeholder="e.g., Reading, Painting, Coding"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="hobby-progress">Initial Progress</Label>
                <span className="text-sm text-muted-foreground">{newHobbyProgress}%</span>
              </div>
              <Slider
                id="hobby-progress"
                value={[newHobbyProgress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setNewHobbyProgress(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddHobbyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHobby}>Add Hobby</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
