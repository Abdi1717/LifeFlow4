'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Suspense } from 'react'
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Add preconnect for commonly used domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
} 