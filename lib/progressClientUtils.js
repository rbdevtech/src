"use client"

// Calculate remaining wait time in milliseconds
export function calculateRemainingTime(dateStr, waitHours) {
  if (!dateStr) return null

  const date = new Date(dateStr)
  const waitMs = waitHours * 60 * 60 * 1000
  const targetTime = new Date(date.getTime() + waitMs)
  const now = new Date()

  const remainingMs = targetTime.getTime() - now.getTime()
  return remainingMs > 0 ? remainingMs : 0
}

// Calculate waiting percentage
export function calculateWaitingPercentage(dateStr, waitHours) {
  if (!dateStr) return 0

  const date = new Date(dateStr)
  const waitMs = waitHours * 60 * 60 * 1000
  const targetTime = date.getTime() + waitMs
  const now = new Date().getTime()

  // If wait time has passed, return 100%
  if (now >= targetTime) return 100

  // Calculate how much of the wait time has passed
  const elapsedMs = now - date.getTime()
  const percentage = Math.floor((elapsedMs / waitMs) * 100)

  return Math.min(Math.max(percentage, 0), 100) // Ensure between 0-100
}

// Format remaining time as hours, minutes, seconds
export function formatRemainingTime(remainingMs) {
  if (!remainingMs || remainingMs <= 0) return "Ready"

  const hours = Math.floor(remainingMs / (60 * 60 * 1000))
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s remaining`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`
  } else {
    return `${seconds}s remaining`
  }
}
