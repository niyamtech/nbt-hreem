"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SpiritualEntry {
  id: string
  date: string
  rating: number
  notes: string
  activities: string[]
}

interface SpiritualTrackerProps {
  date: Date
}

export function SpiritualTracker({ date }: SpiritualTrackerProps) {
  const [entries, setEntries] = useState<SpiritualEntry[]>(() => {
    // Load entries from localStorage if available
    if (typeof window !== "undefined") {
      const savedEntries = localStorage.getItem("dashboard-spiritual")
      return savedEntries ? JSON.parse(savedEntries) : []
    }
    return []
  })

  const [rating, setRating] = useState<number>(5)
  const [notes, setNotes] = useState("")
  const [activities, setActivities] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard-spiritual", JSON.stringify(entries))
  }, [entries])

  const formattedDate = format(date, "yyyy-MM-dd")
  const todayEntry = entries.find((entry) => entry.date === formattedDate)

  // Initialize form with today's entry if it exists
  useEffect(() => {
    if (todayEntry) {
      setRating(todayEntry.rating)
      setNotes(todayEntry.notes)
      setActivities(todayEntry.activities)
    } else {
      setRating(5)
      setNotes("")
      setActivities([])
    }
  }, [todayEntry, formattedDate])

  const handleSave = () => {
    if (todayEntry) {
      // Update existing entry
      setEntries(
        entries.map((entry) => (entry.date === formattedDate ? { ...entry, rating, notes, activities } : entry)),
      )
    } else {
      // Create new entry
      const newEntry: SpiritualEntry = {
        id: crypto.randomUUID(),
        date: formattedDate,
        rating,
        notes,
        activities,
      }
      setEntries([...entries, newEntry])
    }
    setIsEditing(false)
  }

  const handleActivityToggle = (activity: string) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter((a) => a !== activity))
    } else {
      setActivities([...activities, activity])
    }
  }

  const spiritualActivities = [
    "Meditation",
    "Prayer",
    "Reading spiritual texts",
    "Yoga",
    "Nature walk",
    "Gratitude practice",
    "Journaling",
    "Community service",
  ]

  const getRatingLabel = (rating: number) => {
    const labels = [
      "Very Low",
      "Low",
      "Moderate",
      "Good",
      "Very Good",
      "Excellent",
      "Transcendent",
      "Blissful",
      "Divine",
      "Enlightened",
    ]
    return labels[rating - 1] || "Not Rated"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spiritual Wellbeing</CardTitle>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            {todayEntry ? "Edit" : "Add Entry"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spiritual-rating">How spiritual do you feel today?</Label>
              <Select value={rating.toString()} onValueChange={(value) => setRating(Number.parseInt(value))}>
                <SelectTrigger id="spiritual-rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} - {getRatingLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Spiritual activities today</Label>
              <div className="grid grid-cols-2 gap-2">
                {spiritualActivities.map((activity) => (
                  <Button
                    key={activity}
                    type="button"
                    variant={activities.includes(activity) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleActivityToggle(activity)}
                  >
                    {activity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spiritual-notes">Reflections</Label>
              <Textarea
                id="spiritual-notes"
                placeholder="Write your spiritual reflections for today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : todayEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Spiritual Rating</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{todayEntry.rating}</span>
                <span className="ml-2 text-muted-foreground">{getRatingLabel(todayEntry.rating)}</span>
              </div>
            </div>

            {todayEntry.activities.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {todayEntry.activities.map((activity) => (
                    <div key={activity} className="rounded-full bg-secondary px-3 py-1 text-sm">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {todayEntry.notes && (
              <div>
                <h4 className="mb-2 font-medium">Reflections</h4>
                <p className="text-muted-foreground">{todayEntry.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No spiritual entry for {format(date, "MMMM d, yyyy")}</p>
            <Button className="mt-4" onClick={() => setIsEditing(true)}>
              Add Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
