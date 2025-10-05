import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

function ResponsiveBreadcrumb({ items = [], className = "" }) {
  if (!items.length) return null

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-sm">
        {/* Home link */}
        <li>
          <Link
            to="/app/dashboard"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-32 sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium truncate max-w-32 sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default ResponsiveBreadcrumb