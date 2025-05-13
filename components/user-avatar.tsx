'use client'

import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  image?: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ name, image, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  }

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <Avatar className={sizeClasses[size]}>
      {image ? (
        <AvatarImage asChild className="object-cover">
          <Image 
            src={image} 
            alt={name} 
            width={size === 'lg' ? 56 : size === 'md' ? 40 : 32} 
            height={size === 'lg' ? 56 : size === 'md' ? 40 : 32}
            loading="lazy"
            priority={false}
          />
        </AvatarImage>
      ) : (
        <AvatarImage src="" alt={name} />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
} 