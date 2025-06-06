"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, Class } from "@/types"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Task) => void
  selectedDate: Date
}

export function CreateTaskDialog({ open, onOpenChange, onAddTask, selectedDate }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subcategory, setSubcategory] = useState<"task" | "homework" | "project" | "study">("task")
  const [notes, setNotes] = useState("")
  const [classId, setClassId] = useState<string>("")
  const [classes, setClasses] = useState<Class[]>([])

  // Load classes from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClasses = localStorage.getItem("dashboard-classes")
      setClasses(savedClasses ? JSON.parse(savedClasses) : [])
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      subcategory,
      completed: false,
      date: format(selectedDate, "yyyy-MM-dd"),
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
      classId: classId || undefined,
    }

    onAddTask(newTask)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSubcategory("task")
    setNotes("")
    setClassId("")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task for {format(selectedDate, "MMMM d, yyyy")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task"
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory">Type</Label>
                <Select
                  value={subcategory}
                  onValueChange={(value: "task" | "homework" | "project" | "study") => setSubcategory(value)}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="homework">Homework</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class">Class (optional)</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-class">No Class</SelectItem>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or details"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
