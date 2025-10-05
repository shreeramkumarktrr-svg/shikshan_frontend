function ResponsiveCard({ 
  children, 
  title, 
  subtitle,
  actions,
  className = "",
  padding = "default" 
}) {
  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    default: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  }

  return (
    <div className={`card-responsive ${className}`}>
      {(title || subtitle || actions) && (
        <div className="card-header-responsive">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}

// Card Grid for responsive layouts
export function CardGrid({ children, columns = "auto", className = "" }) {
  const gridClasses = {
    auto: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",
    1: "grid grid-cols-1 gap-4 sm:gap-6",
    2: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
    3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
    4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
  }

  return (
    <div className={`${gridClasses[columns]} ${className}`}>
      {children}
    </div>
  )
}

// Stat Card for dashboards
export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon,
  className = "" 
}) {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  }

  return (
    <ResponsiveCard className={className}>
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]} mt-1`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </ResponsiveCard>
  )
}

export default ResponsiveCard