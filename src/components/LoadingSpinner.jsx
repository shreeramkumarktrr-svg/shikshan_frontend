function LoadingSpinner({ size = 'md', className = '', centered = false }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const spinnerElement = (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
  )

  if (centered) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        {spinnerElement}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinnerElement}
    </div>
  )
}

export function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function CenteredLoader({ size = 'lg', message = null, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-64 py-12 ${className}`}>
      <LoadingSpinner size={size} />
      {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
    </div>
  )
}

export default LoadingSpinner