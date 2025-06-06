"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Home, LayoutDashboard, ListTodo, Menu, Settings, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <nav className="flex flex-col h-full bg-muted/40">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-6 w-6" />
                <span>Dashboard</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <SidebarNav />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="hidden border-r bg-muted/40 md:block md:w-64">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span>Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 py-2">
          <SidebarNav />
        </div>
      </nav>
    </>
  )
}

function SidebarNav() {
  return (
    <div className="grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center">
      <NavItem href="/" icon={Home}>
        Home
      </NavItem>
      <NavItem href="#" icon={ListTodo} active>
        Tasks
      </NavItem>
      <NavItem href="#" icon={Calendar}>
        Calendar
      </NavItem>
      <NavItem href="#" icon={BookOpen}>
        Classroom
      </NavItem>
      <NavItem href="#" icon={Settings}>
        Settings
      </NavItem>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  active?: boolean
}

function NavItem({ href, icon: Icon, children, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  )
}
