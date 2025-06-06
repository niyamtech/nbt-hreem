"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wand2 } from "lucide-react"
import type { Task } from "@/types"

interface TaskNotesDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => void
}

export function TaskNotesDialog({ task, open, onOpenChange, onSave }: TaskNotesDialogProps) {
  const [notes, setNotes] = useState(task.notes || "")
  const [isCorrectingGrammar, setIsCorrectingGrammar] = useState(false)

  const correctGrammar = async () => {
    if (!notes.trim()) return

    setIsCorrectingGrammar(true)

    // Simulate grammar correction (in a real app, you'd call an AI service)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple grammar corrections for demo
    let correctedText = notes
      .replace(/\bi\b/g, "I")
      .replace(/\bim\b/g, "I'm")
      .replace(/\bdont\b/g, "don't")
      .replace(/\bcant\b/g, "can't")
      .replace(/\bwont\b/g, "won't")
      .replace(/\bitsits\b/g, "it's")
      .replace(/\byour\b(?=\s+(a|an|the|going|coming|doing))/g, "you're")
      .replace(/\bthere\b(?=\s+(a|an|the|going|coming|doing))/g, "they're")
      .replace(/\s+/g, " ")
      .trim()

    // Capitalize first letter of sentences
    correctedText = correctedText.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())

    setNotes(correctedText)
    setIsCorrectingGrammar(false)
  }

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      notes: notes.trim() || undefined,
    }
    onSave(updatedTask)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Notes</DialogTitle>
          <DialogDescription>Add notes and thoughts about: {task.title}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-notes">Notes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={correctGrammar}
                disabled={isCorrectingGrammar || !notes.trim()}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-3 w-3" />
                {isCorrectingGrammar ? "Correcting..." : "Fix Grammar"}
              </Button>
            </div>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes, thoughts, or progress updates here..."
              className="min-h-[200px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
