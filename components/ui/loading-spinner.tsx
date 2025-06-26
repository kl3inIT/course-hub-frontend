interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center p-4'

  return (
    <div className={containerClasses}>
      <div className='text-center'>
        <div
          className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizeClasses[size]}`}
        ></div>
        <p className='mt-2 text-muted-foreground'>{message}</p>
      </div>
    </div>
  )
}
