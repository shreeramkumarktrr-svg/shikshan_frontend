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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600">Mark and track attendance for students and staff</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'students' && <StudentAttendance />}
        {activeTab === 'staff' && <StaffAttendance />}
        {activeTab === 'reports' && hasRole(['school_admin', 'principal']) && <AttendanceReports />}
      </div>
    </div>
  )
}

export default Attendance