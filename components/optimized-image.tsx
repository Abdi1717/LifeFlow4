'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:2'
  fallback?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  aspectRatio = '16:9',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgSrc, setImgSrc] = useState(src)

  // Aspect ratio classes
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]'
  }

  return (
    <div className={cn('overflow-hidden', aspectRatioClasses[aspectRatio])}>
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          'object-cover w-full h-full duration-700 ease-in-out',
          isLoading 
            ? 'scale-105 blur-sm grayscale'
            : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setImgSrc(fallback)
        }}
        loading="lazy"
        placeholder="blur"
        blurDataURL={fallback}
        {...props}
      />
    </div>
  )
} 