export interface Task {
  id: string
  title: string
  description?: string
  category: "atom" | "molecule" | "compound"
  subcategory: "task" | "hobby" | "learning"
  completed: boolean
  date: string
  createdAt: string
  movedFromPreviousDay?: boolean
}

export interface Class {
  id: string
  name: string
  description?: string
  color: string
  instructor?: string
  schedule?: string
  createdAt: string
}
