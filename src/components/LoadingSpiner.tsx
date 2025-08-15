interface LoadingSpinnerProps {
  size?: "small" | "default" | "large"
  className?: string
  text?: string
}

const LoadingSpinner = ({ size = "large", className = "", text }: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      {text && <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
