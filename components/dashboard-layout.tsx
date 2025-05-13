import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <MobileSidebar />
            <h1 className="text-xl font-bold md:hidden">LifeFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 