import { NavLink } from 'react-router-dom';
import { useFeatureAccess } from './FeatureGuard';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

function NavigationItem({ item, onClose }) {
  const { user } = useAuth();
  const { hasAccess, loading } = useFeatureAccess(item.feature || 'always_available');

  // Super admin users have access to all features
  const isSuperAdmin = user?.role === 'super_admin';
  const shouldShowAsAvailable = isSuperAdmin || !item.feature || hasAccess;

  // If no feature is specified, always show the item
  if (!item.feature) {
    return (
      <NavLink
        key={item.name}
        to={item.href}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive
              ? 'bg-primary-100 text-primary-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
      >
        <item.icon
          className="mr-3 flex-shrink-0 h-6 w-6"
          aria-hidden="true"
        />
        {item.name}
      </NavLink>
    );
  }

  // Show loading state (but not for super admin)
  if (loading && !isSuperAdmin) {
    return (
      <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400">
        <div className="mr-3 flex-shrink-0 h-6 w-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    );
  }

  // Feature not available - show locked item (but not for super admin)
  if (!shouldShowAsAvailable) {
    return (
      <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
        <div className="relative mr-3 flex-shrink-0">
          <item.icon className="h-6 w-6 opacity-50" aria-hidden="true" />
          <LockClosedIcon className="absolute -top-1 -right-1 h-3 w-3 text-gray-500" />
        </div>
        <span className="opacity-50">{item.name}</span>
        <span className="ml-auto text-xs text-gray-400">Upgrade</span>
      </div>
    );
  }

  // Feature available - show normal navigation item
  return (
    <NavLink
      key={item.name}
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-primary-100 text-primary-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <item.icon
        className="mr-3 flex-shrink-0 h-6 w-6"
        aria-hidden="true"
      />
      {item.name}
    </NavLink>
  );
}

export default NavigationItem;