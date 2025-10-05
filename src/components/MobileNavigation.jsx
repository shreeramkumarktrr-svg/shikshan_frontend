import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  DocumentTextIcon
} from '@heroicons/react/24/outline'

function MobileNavigation() {
  const { user, hasRole } = useAuth()

  // Super Admin Navigation - Platform level management
  const superAdminNavigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },
    { name: 'Schools', href: '/app/schools', icon: BuildingOfficeIcon },
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
    { name: 'Attendance', href: '/app/attendance', icon: ClipboardDocumentListIcon, roles: ['school_admin', 'principal', 'teacher'] },
    { name: 'Homework', href: '/app/homework', icon: CalendarIcon, roles: ['school_admin', 'principal', 'teacher', 'student', 'parent'] },
    { name: 'Events', href: '/app/events', icon: SpeakerWaveIcon, roles: ['all'] },
    { name: 'Complaints', href: '/app/complaints', icon: ExclamationTriangleIcon, roles: ['all'] },
    { name: 'Fees', href: '/app/fees', icon: CurrencyDollarIcon, roles: ['school_admin', 'principal', 'finance_officer', 'parent'] }
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

  // Show only first 4 items for mobile bottom navigation
  const mobileNavigation = filteredNavigation.slice(0, 4)

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 h-16">
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `mobile-nav-item transition-colors ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <div className="mobile-nav-icon">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="mobile-nav-text">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default MobileNavigation