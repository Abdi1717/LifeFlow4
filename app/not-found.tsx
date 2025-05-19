'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Page Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We couldn't find the page you're looking for.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            Go Back Home
          </Link>
        </Button>
      </div>
    </div>
  )
} 