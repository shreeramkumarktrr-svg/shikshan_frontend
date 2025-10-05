import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendanceAPI, classesAPI, usersAPI } from '../utils/api'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

function AttendanceReports() {
  const [reportType, setReportType] = useState('overview')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.getAll({ limit: 100 }),
    retry: 1,
    retryDelay: 1000
  })

  // Fetch staff
  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: () => usersAPI.getAll({ 
      role: 'teacher,school_admin,principal,finance_officer,support_staff',
      limit: 100 
    }),
    retry: 1,
    retryDelay: 1000
  })

  // Fetch student attendance stats
  const { data: studentStatsData, isLoading: studentStatsLoading } = useQuery({
    queryKey: ['student-attendance-stats', dateRange, selectedClass],
    queryFn: () => selectedClass ? 
      attendanceAPI.getByClass(selectedClass, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }) : 
      Promise.resolve({ data: null }),
    enabled: reportType === 'students' && !!selectedClass,
    retry: 1,
    retryDelay: 1000
  })

  // Fetch staff attendance stats
  const { data: staffStatsData, isLoading: staffStatsLoading, error: staffStatsError } = useQuery({
    queryKey: ['staff-attendance-stats', dateRange, selectedStaff],
    queryFn: () => attendanceAPI.getStaffStats({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      staffId: selectedStaff
    }),
    enabled: reportType === 'staff',
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Staff stats error:', error);
    }
  })

  // Fetch overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['attendance-overview', dateRange],
    queryFn: () => attendanceAPI.getOverview({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }),
    enabled: reportType === 'overview',
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Failed to fetch overview data:', error);
    }
  })

  const classes = Array.isArray(classesData?.data?.classes) ? classesData.data.classes : []
  const staff = Array.isArray(staffData?.data?.users) ? staffData.data.users : []

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'students', name: 'Student Reports', icon: UserGroupIcon },
    { id: 'staff', name: 'Staff Reports', icon: AcademicCapIcon }
  ]

  const renderOverview = () => {
    if (overviewLoading) return <LoadingSpinner />

    const staffStats = overviewData?.data?.monthly?.staff || {}
    const studentStats = overviewData?.data?.monthly?.students || {}
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Overview */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-500" />
                Staff Attendance Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Days:</span>
                  <span className="font-medium">{staffStats.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Present Days:</span>
                  <span className="font-medium text-green-600">{staffStats.present || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Absent Days:</span>
                  <span className="font-medium text-red-600">{staffStats.absent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance Rate:</span>
                  <span className="font-medium text-blue-600">{staffStats.percentage || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Late Arrivals:</span>
                  <span className="font-medium text-yellow-600">{staffStats.late || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-purple-500" />
                Quick Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
                  <div className="text-sm text-blue-800">Total Classes</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{staff.length}</div>
                  <div className="text-sm text-green-800">Total Staff</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((staffStats.percentage || 0))}%
                  </div>
                  <div className="text-sm text-purple-800">Staff Attendance</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((studentStats.percentage || 0))}%
                  </div>
                  <div className="text-sm text-orange-800">Student Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStudentReports = () => {
    if (!selectedClass) {
      return (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-500">Choose a class to view detailed student attendance reports.</p>
        </div>
      )
    }

    if (studentStatsLoading) return <LoadingSpinner />

    const reportData = studentStatsData?.data?.attendance || []
    const classInfo = classes.find(c => c.id === selectedClass) || {}

    return (
      <div className="space-y-6">
        {/* Class Info */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {classInfo.name} - Grade {classInfo.grade} Section {classInfo.section}
            </h3>
            <p className="text-gray-600">
              Report Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Student Reports Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.length > 0 ? reportData.map((record) => (
                    <tr key={record.id || record.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.student?.firstName} {record.student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        1
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {record.status === 'present' ? 1 : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {record.status === 'absent' ? 1 : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {record.status === 'late' ? 1 : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No attendance records found for the selected class and date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStaffReports = () => {
    if (staffStatsLoading) return <LoadingSpinner />

    // Handle error state
    if (staffStatsError) {
      return (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Staff Data</h3>
          <p className="text-gray-500 mb-4">
            {staffStatsError.response?.data?.error || 'Failed to load staff attendance statistics'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      )
    }

    const stats = staffStatsData?.data?.statistics || {}
    
    // If no data, show message
    if (!staffStatsData?.data || Object.keys(stats).length === 0) {
      return (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Attendance Data</h3>
          <p className="text-gray-500 mb-2">No staff attendance records found for the selected date range.</p>
          <p className="text-sm text-gray-400">
            Date range: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Staff Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body text-center">
              <CalendarDaysIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalDays || 0}</div>
              <div className="text-sm text-gray-500">Total Days</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <UserGroupIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.presentDays || 0}</div>
              <div className="text-sm text-gray-500">Present Days</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.attendancePercentage || 0}%</div>
              <div className="text-sm text-gray-500">Attendance Rate</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <CalendarDaysIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalWorkingHours || 0}h</div>
              <div className="text-sm text-gray-500">Working Hours</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{stats.present || 0}</div>
                <div className="text-sm text-green-800">Present</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{stats.absent || 0}</div>
                <div className="text-sm text-red-800">Absent</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">{stats.late || 0}</div>
                <div className="text-sm text-yellow-800">Late</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{stats.sick_leave || 0}</div>
                <div className="text-sm text-blue-800">Sick Leave</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance Reports & Analytics</h2>
          <p className="text-gray-600">View comprehensive attendance reports and statistics</p>
        </div>
        <button className="btn-outline">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reportTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  reportType === type.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    reportType === type.id
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {type.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input"
              />
            </div>
            {reportType === 'students' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Grade {cls.grade} Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {reportType === 'staff' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member (Optional)
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="input"
                >
                  <option value="">All Staff</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {reportType === 'overview' && renderOverview()}
        {reportType === 'students' && renderStudentReports()}
        {reportType === 'staff' && renderStaffReports()}
      </div>
    </div>
  )
}

export default AttendanceReports