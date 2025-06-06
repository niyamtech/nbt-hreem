"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Trash2, BookOpen, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Class, Task } from "@/types"

interface ClassroomTrackerProps {
  date: Date
  tasks: Task[]
}

const colorOptions = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
]

export function ClassroomTracker({ date, tasks }: ClassroomTrackerProps) {
  const [classes, setClasses] = useState<Class[]>(() => {
    if (typeof window !== "undefined") {
      const savedClasses = localStorage.getItem("dashboard-classes")
      return savedClasses ? JSON.parse(savedClasses) : []
    }
    return []
  })

  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [newClassName, setNewClassName] = useState("")
  const [newClassDescription, setNewClassDescription] = useState("")
  const [newClassInstructor, setNewClassInstructor] = useState("")
  const [newClassSchedule, setNewClassSchedule] = useState("")
  const [newClassColor, setNewClassColor] = useState("blue")

  useEffect(() => {
    localStorage.setItem("dashboard-classes", JSON.stringify(classes))
  }, [classes])

  const addClass = () => {
    if (!newClassName.trim()) return

    const newClass: Class = {
      id: crypto.randomUUID(),
      name: newClassName,
      description: newClassDescription || undefined,
      instructor: newClassInstructor || undefined,
      schedule: newClassSchedule || undefined,
      color: newClassColor,
      createdAt: new Date().toISOString(),
    }

    setClasses([...classes, newClass])
    resetForm()
    setIsAddClassOpen(false)
  }

  const deleteClass = (classId: string) => {
    setClasses(classes.filter((cls) => cls.id !== classId))
    if (selectedClassId === classId) {
      setSelectedClassId("all")
    }
  }

  const resetForm = () => {
    setNewClassName("")
    setNewClassDescription("")
    setNewClassInstructor("")
    setNewClassSchedule("")
    setNewClassColor("blue")
  }

  const getClassById = (classId: string) => {
    return classes.find((cls) => cls.id === classId)
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      indigo: "bg-indigo-500",
      pink: "bg-pink-500",
      teal: "bg-teal-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  const filteredTasks =
    selectedClassId === "all"
      ? tasks.filter((task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
      : tasks.filter(
          (task) =>
            format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
            task.classId === selectedClassId,
        )

  const getTaskStats = (classId?: string) => {
    const classTasks = classId ? tasks.filter((task) => task.classId === classId) : tasks

    const todayTasks = classTasks.filter(
      (task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    )

    const completed = todayTasks.filter((task) => task.completed).length
    const total = todayTasks.length

    return { completed, total }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Classroom</h2>
        <Button onClick={() => setIsAddClassOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Class Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="class-filter">Filter by Class:</Label>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger id="class-filter" className="w-64">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getColorClass(cls.color)}`} />
                  {cls.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classes Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const stats = getTaskStats(cls.id)
          return (
            <Card key={cls.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(cls.color)}`} />
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Class options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteClass(cls.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cls.description && <p className="text-sm text-muted-foreground">{cls.description}</p>}

                  <div className="space-y-2">
                    {cls.instructor && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{cls.instructor}</span>
                      </div>
                    )}
                    {cls.schedule && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>{cls.schedule}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Today's Tasks</span>
                    <Badge variant="secondary">
                      {stats.completed}/{stats.total}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tasks for Selected Class */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {selectedClassId === "all"
              ? "All Classroom Tasks"
              : `${getClassById(selectedClassId)?.name || "Unknown"} Tasks`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No tasks for {selectedClassId === "all" ? "today" : "this class today"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const taskClass = task.classId ? getClassById(task.classId) : null
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={task.completed} disabled />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </span>
                          {taskClass && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getColorClass(taskClass.color)}`} />
                              <span className="text-xs text-muted-foreground">{taskClass.name}</span>
                            </div>
                          )}
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      </div>
                    </div>
                    <Badge variant="outline">{task.subcategory}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Class Dialog */}
      <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>Create a new class for your classroom</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Mathematics, History, Science"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="class-description">Description (optional)</Label>
              <Textarea
                id="class-description"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                placeholder="Brief description of the class"
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class-instructor">Instructor (optional)</Label>
                <Input
                  id="class-instructor"
                  value={newClassInstructor}
                  onChange={(e) => setNewClassInstructor(e.target.value)}
                  placeholder="Teacher name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class-schedule">Schedule (optional)</Label>
                <Input
                  id="class-schedule"
                  value={newClassSchedule}
                  onChange={(e) => setNewClassSchedule(e.target.value)}
                  placeholder="e.g., Mon/Wed 10:00 AM"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="class-color">Color</Label>
              <Select value={newClassColor} onValueChange={setNewClassColor}>
                <SelectTrigger id="class-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClassOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addClass}>Add Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
