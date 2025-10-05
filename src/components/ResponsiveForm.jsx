import { forwardRef } from 'react'

// Form Container
export function FormContainer({ children, className = "", ...props }) {
  return (
    <form className={`space-y-4 sm:space-y-6 ${className}`} {...props}>
      {children}
    </form>
  )
}

// Form Grid
export function FormGrid({ children, columns = 1, className = "" }) {
  const gridClasses = {
    1: 'grid grid-cols-1 gap-4 sm:gap-6',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'
  }

  return (
    <div className={`${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  )
}

// Form Field
export function FormField({ children, className = "" }) {
  return (
    <div className={`space-y-1 sm:space-y-2 ${className}`}>
      {children}
    </div>
  )
}

// Form Label
export function FormLabel({ children, required = false, className = "", ...props }) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Form Input
export const FormInput = forwardRef(({ 
  type = "text", 
  error = false, 
  className = "", 
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={`
        input-responsive w-full
        ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
        ${className}
      `}
      {...props}
    />
  )
})

FormInput.displayName = 'FormInput'

// Form Textarea
export const FormTextarea = forwardRef(({ 
  error = false, 
  rows = 3,
  className = "", 
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`
        input-responsive w-full resize-none
        ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
        ${className}
      `}
      {...props}
    />
  )
})

FormTextarea.displayName = 'FormTextarea'

// Form Select
export const FormSelect = forwardRef(({ 
  children, 
  error = false, 
  className = "", 
  ...props 
}, ref) => {
  return (
    <select
      ref={ref}
      className={`
        input-responsive w-full
        ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  )
})

FormSelect.displayName = 'FormSelect'

// Form Error
export function FormError({ children, className = "" }) {
  if (!children) return null
  
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {children}
    </p>
  )
}

// Form Help Text
export function FormHelp({ children, className = "" }) {
  if (!children) return null
  
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

// Form Actions
export function FormActions({ children, className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 ${className}`}>
      {children}
    </div>
  )
}

// Form Button
export function FormButton({ 
  children, 
  variant = "primary", 
  type = "button",
  fullWidth = false,
  size = "default",
  className = "", 
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target"
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm sm:px-5 sm:py-2.5",
    lg: "px-6 py-3 text-base sm:px-8 sm:py-3"
  }
  
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
    outline: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
  }

  const widthClasses = fullWidth ? "w-full" : "w-full sm:w-auto"

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}