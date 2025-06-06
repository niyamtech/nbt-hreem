"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { ClassroomTracker } from "@/components/classroom-tracker"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import type { Task } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductivityGraph } from "@/components/productivity-graph"

export default function Dashboard() {
  const [date, setDate] = useState<Date>(new Date())
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("dashboard-tasks")
      return savedTasks ? JSON.parse(savedTasks) : []
    }
    return []
  })

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboard-tasks", JSON.stringify(tasks))
  }, [tasks])

  // Check for incomplete tasks at end of day and move them to tomorrow
  useEffect(() => {
    const checkEndOfDay = () => {
      const now = new Date()
      if (now.getHours() === 23 && now.getMinutes() === 59) {
        const updatedTasks = tasks.map((task) => {
          if (!task.completed) {
            return {
              ...task,
              date: format(new Date(new Date().setDate(new Date().getDate() + 1)), "yyyy-MM-dd"),
              movedFromPreviousDay: true,
            }
          }
          return task
        })
        setTasks(updatedTasks)
      }
    }

    const interval = setInterval(checkEndOfDay, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [tasks])

  const addTask = (task: Task) => {
    setTasks((prev) => [task, ...prev])
    setIsCreateTaskOpen(false)
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(date, "PPP")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
              <Button onClick={() => setIsCreateTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="classroom">Classroom</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side - Main content area */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Today's Progress</h3>
                      <div className="text-3xl font-bold">
                        {
                          tasks.filter(
                            (task) =>
                              format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
                              task.completed,
                          ).length
                        }
                        <span className="text-lg font-normal opacity-80">
                          /
                          {
                            tasks.filter(
                              (task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
                            ).length
                          }
                        </span>
                      </div>
                      <p className="text-sm opacity-80">Tasks completed</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">This Week</h3>
                      <div className="text-3xl font-bold">
                        {
                          tasks.filter((task) => {
                            const taskDate = new Date(task.date)
                            const weekStart = new Date(date)
                            weekStart.setDate(date.getDate() - date.getDay())
                            const weekEnd = new Date(weekStart)
                            weekEnd.setDate(weekStart.getDate() + 6)
                            return taskDate >= weekStart && taskDate <= weekEnd && task.completed
                          }).length
                        }
                      </div>
                      <p className="text-sm opacity-80">Tasks completed this week</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Productivity Graph */}
                <div className="lg:col-span-1">
                  <ProductivityGraph tasks={tasks} />
                </div>
              </div>

              {/* Bottom section - Task List */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
                <TaskList
                  tasks={tasks.filter(
                    (task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
                  )}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              </div>
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="rounded-md border"
                  />
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Tasks for {format(date, "MMMM d, yyyy")}</h3>
                    <div className="space-y-2">
                      {tasks
                        .filter((task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
                        .map((task) => (
                          <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                            <Checkbox checked={task.completed} disabled />
                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      {tasks.filter((task) => format(new Date(task.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
                        .length === 0 && <p className="text-muted-foreground text-sm">No tasks for this date</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="classroom" className="space-y-4">
              <ClassroomTracker date={date} tasks={tasks} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onAddTask={addTask}
        selectedDate={date}
      />
    </div>
  )
}
