import React from 'react'

export default function LoadingSpinner({ size = 'md', center = false }) {
  const s = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' }
  const spinner = <div className={`animate-spin rounded-full border-blue-600 border-t-transparent ${s[size]}`} />
  if (center) return <div className="flex items-center justify-center py-12">{spinner}</div>
  return spinner
}
