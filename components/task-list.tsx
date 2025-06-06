"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Check, Clock, Edit, MoreHorizontal, Trash, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { TaskNotesDialog } from "@/components/task-notes-dialog"
import type { Task, Class } from "@/types"

interface TaskListProps {
  tasks: Task[]
  updateTask: (task: Task) => void
  deleteTask: (id: string) => void
}

export function TaskList({ tasks, updateTask, deleteTask }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [notesTask, setNotesTask] = useState<Task | null>(null)
  const [classes, setClasses] = useState<Class[]>(() => {
    if (typeof window !== "undefined") {
      const savedClasses = localStorage.getItem("dashboard-classes")
      return savedClasses ? JSON.parse(savedClasses) : []
    }
    return []
  })

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

  const getClassById = (classId: string) => {
    return classes.find((cls) => cls.id === classId)
  }

  const handleToggleComplete = (task: Task) => {
    updateTask({
      ...task,
      completed: !task.completed,
    })
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveEdit = (task: Task) => {
    updateTask(task)
    setEditingTask(null)
  }

  const handleSaveNotes = (task: Task) => {
    updateTask(task)
    setNotesTask(null)
  }

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mt-2 text-lg font-semibold">No tasks for today</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Create a new task to get started.</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start justify-between rounded-lg border p-3 ${
                    task.movedFromPreviousDay ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                        {task.movedFromPreviousDay && (
                          <Badge variant="outline" className="text-orange-500 border-orange-300">
                            Moved from previous day
                          </Badge>
                        )}
                        {task.classId &&
                          (() => {
                            const taskClass = getClassById(task.classId)
                            return taskClass ? (
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getColorClass(taskClass.color)}`} />
                                <span className="text-xs text-muted-foreground">{taskClass.name}</span>
                              </div>
                            ) : null
                          })()}
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">{task.subcategory}</Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(task.createdAt), "h:mm a")}
                        </div>
                        {task.notes && (
                          <div className="flex items-center text-muted-foreground text-xs">
                            <FileText className="mr-1 h-3 w-3" />
                            Has notes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleComplete(task)}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as {task.completed ? "incomplete" : "complete"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNotesTask(task)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={() => setEditingTask(null)}
          onSave={handleSaveEdit}
        />
      )}
      {notesTask && (
        <TaskNotesDialog
          task={notesTask}
          open={!!notesTask}
          onOpenChange={() => setNotesTask(null)}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  )
}
