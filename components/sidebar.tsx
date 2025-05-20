"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, LineChart, Train, CheckSquare, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  
  const routes = [
    {
      href: "/dashboard",
      icon: BarChart3,
      title: "Finance",
    },
    {
      href: "/dashboard/tasks",
      icon: CheckSquare,
      title: "Tasks",
    },
    {
      href: "/dashboard/notes",
      icon: FileText,
      title: "Notes",
    },
    {
      href: "/dashboard/radar",
      icon: LineChart,
      title: "Personal Radar",
    },
    {
      href: "/dashboard/network",
      icon: Users,
      title: "Network",
    },
    {
      href: "/dashboard/commute",
      icon: Train,
      title: "Commute",
    },
  ]

  return (
    <div className={cn("flex flex-col h-full space-y-4 py-4", className)}>
      <div className="px-3 py-2">
        <Link href="/" className="flex items-center mb-4">
          <h1 className="text-xl font-bold">LifeFlow</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                pathname === route.href ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">
          Quick Links
        </h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            asChild
          >
            <Link href="/dashboard/settings">
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 