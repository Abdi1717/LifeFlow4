import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">LifeFlow</h1>
      <p className="text-xl mb-8 max-w-md text-muted-foreground">
        Manage your personal life with clarity, precision, and peace of mind
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </main>
  )
} 