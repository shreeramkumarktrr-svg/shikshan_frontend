import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import StaffAttendance from '../components/StaffAttendance'
import StudentAttendance from '../components/StudentAttendance'
import AttendanceReports from '../components/AttendanceReports'
import FeatureGuard from '../components/FeatureGuard'
import { FEATURES } from '../utils/featureAccess'

function Attendance() {
  const { hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('students')

  const tabs = [
    {
      id: 'students',
      name: 'Student Attendance',
      icon: UserGroupIcon,
      description: 'Mark and manage student attendance by class',
      roles: ['school_admin', 'principal', 'teacher']
    },
    {
      id: 'staff',
      name: 'Staff Attendance',
      icon: AcademicCapIcon,
      description: 'Mark and manage teacher/staff attendance',
      roles: ['school_admin', 'principal', 'teacher']
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      icon: ChartBarIcon,
      description: 'View attendance reports and statistics',
      roles: ['school_admin', 'principal']
    }
  ]

  const visibleTabs = tabs.filter(tab => 
    tab.roles.some(role => hasRole(role))
  )

  return (
    <FeatureGuard 
      feature={FEATURES.ATTENDANCE} 
      mode="show-message"
      showUpgrade={true}
    >
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="px-4 sm:px-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Mark and track attendance for students and staff</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            {/* Desktop Tab Navigation */}
            <nav className="hidden sm:flex -mb-px space-x-8 px-4 sm:px-0">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        activeTab === tab.id
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.name}
                  </button>
                )
              })}
            </nav>

            {/* Mobile Tab Navigation */}
            <div className="sm:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                {visibleTabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-4 sm:mt-6">
            {activeTab === 'students' && <StudentAttendance />}
            {activeTab === 'staff' && <StaffAttendance />}
            {activeTab === 'reports' && hasRole(['school_admin', 'principal']) && <AttendanceReports />}
          </div>
        </div>
    </FeatureGuard>
  )
}

export default Attendance