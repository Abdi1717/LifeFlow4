'use client'

import { useState, useEffect, memo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrollToTopProps {
  threshold?: number
  smooth?: boolean
  position?: 'bottom-right' | 'bottom-left'
  offset?: number
}

function ScrollToTopButton({
  threshold = 300,
  smooth = true,
  position = 'bottom-right',
  offset = 20,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  // Position style
  const positionStyle = position === 'bottom-right'
    ? { right: offset, bottom: offset }
    : { left: offset, bottom: offset }

  // Efficient scroll handler with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    const handleScroll = () => {
      // Skip if already processing a scroll event
      if (timeoutId !== null) return
      
      // Throttle the scroll event to every 100ms
      timeoutId = setTimeout(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop
        setIsVisible(scrollY > threshold)
        timeoutId = null
      }, 100)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial check
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [threshold])

  // Scroll to top with either smooth animation or instant jump
  const scrollToTop = () => {
    setIsScrolling(true)
    
    if (smooth) {
      // Smooth scroll with better performance
      const start = window.scrollY || document.documentElement.scrollTop
      const startTime = performance.now()
      const duration = 500 // ms
      
      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease-out
        
        const newPosition = start * (1 - easeProgress)
        window.scrollTo(0, newPosition)
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          setIsScrolling(false)
        }
      }
      
      requestAnimationFrame(animateScroll)
    } else {
      // Instant scroll
      window.scrollTo(0, 0)
      setIsScrolling(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50"
          style={positionStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={scrollToTop}
            variant="secondary"
            size="icon"
            className="rounded-full shadow-md bg-secondary hover:bg-secondary/80"
            aria-label="Scroll to top"
            disabled={isScrolling}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const ScrollToTop = memo(ScrollToTopButton) 