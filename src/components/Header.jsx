import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  BellIcon, 
  UserCircleIcon, 
  Bars3Icon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'

function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-target flex-shrink-0"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
              <span className="hidden sm:inline">
                {user?.school?.name || 'Shikshan - School Management Platform'}
              </span>
              <span className="sm:hidden">
                {user?.school?.name || 'Shikshan'}
              </span>
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-target flex-shrink-0">
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          {/* User Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1 sm:space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors touch-target"
            >
              <UserCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <span className="hidden sm:block text-sm font-medium truncate max-w-32">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
            
            {showUserMenu && (
              <>
                {/* Mobile backdrop */}
                <div 
                  className="fixed inset-0 z-40 sm:hidden"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {/* User info - mobile only */}
                  <div className="px-4 py-3 border-b border-gray-200 sm:hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <a
                    href="/app/profile"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Your Profile
                  </a>
                  {(user?.role === 'principal' || user?.role === 'school_admin') && (
                    <a
                      href="/app/manage-subscription"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Manage Subscription
                    </a>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header