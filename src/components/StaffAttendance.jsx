import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { attendanceAPI, usersAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import StaffAttendanceModal from './StaffAttendanceModal'

function StaffAttendance() {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    staffId: '',
    status: ''
  })

  // Fetch staff members
  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: () => usersAPI.getAll({ 
      role: 'teacher,school_admin,principal,finance_officer,support_staff',
      active: 'true',
      limit: 100 
    }),
    retry: 1,
    retryDelay: 1000
  })

  // Fetch staff attendance
  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['staff-attendance', filters],
    queryFn: () => attendanceAPI.getStaff(filters),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000
  })

  // Mark staff attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: attendanceAPI.markStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-attendance'])
      setIsMarkingModalOpen(false)
      toast.success('Staff attendance marked successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to mark attendance')
    }
  })

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }) => attendanceAPI.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-attendance'])
      toast.success('Attendance updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update attendance')
    }
  })

  const handleMarkAttendance = (attendanceData) => {
    markAttendanceMutation.mutate({
      date: selectedDate,
      attendanceRecords: attendanceData
    })
  }

  const handleUpdateAttendance = (id, data) => {
    updateAttendanceMutation.mutate({ id, data })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'absent':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'late':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'half_day':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
      case 'sick_leave':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
      case 'casual_leave':
        return <ExclamationTriangleIcon className="h-5 w-5 text-purple-500" />
      case 'official_duty':
        return <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
      default:
        return <UserIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'badge-success'
      case 'absent':
        return 'badge-danger'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'half_day':
        return 'bg-orange-100 text-orange-800'
      case 'sick_leave':
        return 'bg-blue-100 text-blue-800'
      case 'casual_leave':
        return 'bg-purple-100 text-purple-800'
      case 'official_duty':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canMarkAttendance = hasRole(['school_admin', 'principal']) || 
    (hasRole('teacher') && user?.role === 'teacher')

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <XCircleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Attendance</h3>
        <p className="text-gray-500 mb-4">Unable to load staff attendance data.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  const attendance = attendanceData?.data?.attendance || []
  const staff = Array.isArray(staffData?.data?.users) ? staffData.data.users : []

  // Calculate statistics
  const stats = attendance.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1
    return acc
  }, {})

  const totalRecords = attendance.length
  const presentCount = (stats.present || 0) + (stats.late || 0) + (stats.half_day || 0) + (stats.official_duty || 0)
  const attendancePercentage = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <UserIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalRecords}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{presentCount}</div>
            <div className="text-sm text-gray-500">Present/Working</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.absent || 0}</div>
            <div className="text-sm text-gray-500">Absent</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
            <div className="text-sm text-gray-500">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date for Marking
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
          {canMarkAttendance && (
            <div className="pt-6">
              <button
                onClick={() => setIsMarkingModalOpen(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Mark Attendance
              </button>
            </div>
          )}
        </div>
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
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Member
              </label>
              <select
                value={filters.staffId}
                onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="casual_leave">Casual Leave</option>
                <option value="official_duty">Official Duty</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="card-body p-0">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-500">
                {canMarkAttendance 
                  ? "Start by marking attendance for today."
                  : "No attendance records match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.staff?.firstName} {record.staff?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.staff?.role?.replace('_', ' ')} • {record.staff?.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(record.status)}
                          <span className={`ml-2 badge ${getStatusColor(record.status)}`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {record.checkInTime && (
                            <div>In: {record.checkInTime}</div>
                          )}
                          {record.checkOutTime && (
                            <div>Out: {record.checkOutTime}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.workingHours ? `${record.workingHours}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.markedByUser?.firstName} {record.markedByUser?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {isMarkingModalOpen && (
        <StaffAttendanceModal
          date={selectedDate}
          staff={staff}
          onSave={handleMarkAttendance}
          onClose={() => setIsMarkingModalOpen(false)}
          isLoading={markAttendanceMutation.isLoading}
        />
      )}
    </div>
  )
}

export default StaffAttendance