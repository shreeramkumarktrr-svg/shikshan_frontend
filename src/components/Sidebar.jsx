import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FEATURES } from '../utils/featureAccess'
import NavigationItem from './NavigationItem'
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

function Sidebar({ onClose }) {
  const { user, hasRole } = useAuth()

  // Super Admin Navigation - Platform level management
  const superAdminNavigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },
    { name: 'Schools', href: '/app/schools', icon: BuildingOfficeIcon },
    { name: 'Interested Visitors', href: '/app/interested-visitors', icon: UsersIcon },
    { name: 'Subscriptions', href: '/app/subscriptions', icon: DocumentTextIcon },
    { name: 'Payments', href: '/app/payments', icon: CreditCardIcon },
    { name: 'Analytics', href: '/app/analytics', icon: ChartBarIcon }
  ]

  // School Level Navigation - School management
  const schoolNavigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon, roles: ['all'] },
    { name: 'Teachers', href: '/app/teachers', icon: AcademicCapIcon, roles: ['school_admin', 'principal'] },
    { name: 'Students', href: '/app/students', icon: UserGroupIcon, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Classes', href: '/app/classes', icon: AcademicCapIcon, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Attendance', href: '/app/attendance', icon: ClipboardDocumentListIcon, roles: ['school_admin', 'principal', 'teacher'], feature: FEATURES.ATTENDANCE },
    { name: 'Homework', href: '/app/homework', icon: CalendarIcon, roles: ['school_admin', 'principal', 'teacher', 'student', 'parent'], feature: FEATURES.HOMEWORK },
    { name: 'Events', href: '/app/events', icon: SpeakerWaveIcon, roles: ['all'], feature: FEATURES.EVENTS },
    { name: 'Complaints', href: '/app/complaints', icon: ExclamationTriangleIcon, roles: ['all'] },
    { name: 'Fees', href: '/app/fees', icon: CurrencyDollarIcon, roles: ['school_admin', 'principal', 'finance_officer', 'parent', 'student'], feature: FEATURES.FEES },
    { name: 'Reports', href: '/app/reports', icon: ChartBarIcon, roles: ['school_admin', 'principal', 'teacher'], feature: FEATURES.REPORTS }
  ]

  // Choose navigation based on user role
  const navigation = hasRole('super_admin') ? superAdminNavigation : schoolNavigation

  const filteredNavigation = hasRole('super_admin') 
    ? navigation // Super admin sees all super admin items
    : navigation.filter(item => {
        if (!item.roles) return true // Dashboard doesn't have roles restriction
        if (item.roles.includes('all')) return true
        return item.roles.some(role => hasRole(role))
      })

  
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
        <h1 className="text-xl font-bold text-white">Shikshan</h1>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-primary-200 hover:text-white hover:bg-primary-700 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="sidebar-nav">
          {filteredNavigation.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              onClose={onClose}
            />
          ))}
        </div>
      </nav>
      
      {/* User info */}
      <div className="sidebar-user-info">
        <div className="sidebar-user-avatar">
          <span className="text-sm font-medium text-primary-600">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div className="sidebar-user-details">
          <p className="text-sm font-medium text-gray-700 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 capitalize truncate">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar