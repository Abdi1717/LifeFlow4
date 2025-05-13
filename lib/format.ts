/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a date to a readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Generate a short time ago string
 */
export function timeAgo(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (seconds < 60) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else {
    return formatDate(then)
  }
} 