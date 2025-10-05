import { useState, useEffect } from 'react'
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

function StaffAttendanceModal({ date, staff = [], onSave, onClose, isLoading }) {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [selectAll, setSelectAll] = useState('present')

  useEffect(() => {
    // Initialize attendance records for all staff
    const initialRecords = staff.map(member => ({
      staffId: member.id,
      status: 'present',
      checkInTime: '09:00',
      checkOutTime: '17:00',
      workingHours: 8,
      remarks: ''
    }))
    setAttendanceRecords(initialRecords)
  }, [staff])

  const handleStatusChange = (staffId, field, value) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.staffId === staffId 
          ? { ...record, [field]: value }
          : record
      )
    )
  }

  const handleSelectAllChange = (status) => {
    setSelectAll(status)
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, status }))
    )
  }

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    
    const [inHour, inMin] = checkIn.split(':').map(Number)
    const [outHour, outMin] = checkOut.split(':').map(Number)
    
    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin
    
    const diffMinutes = outMinutes - inMinutes
    return Math.max(0, diffMinutes / 60)
  }

  const handleTimeChange = (staffId, field, value) => {
    setAttendanceRecords(prev => 
      prev.map(record => {
        if (record.staffId === staffId) {
          const updatedRecord = { ...record, [field]: value }
          
          // Auto-calculate working hours when both times are set
          if (field === 'checkInTime' || field === 'checkOutTime') {
            const checkIn = field === 'checkInTime' ? value : record.checkInTime
            const checkOut = field === 'checkOutTime' ? value : record.checkOutTime
            updatedRecord.workingHours = calculateWorkingHours(checkIn, checkOut)
          }
          
          return updatedRecord
        }
        return record
      })
    )
  }

  const handleSubmit = () => {
    // Validate required fields
    const invalidRecords = attendanceRecords.filter(record => !record.status)
    if (invalidRecords.length > 0) {
      alert('Please select status for all staff members')
      return
    }

    onSave(attendanceRecords)
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
        return null
    }
  }

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'text-green-600' },
    { value: 'absent', label: 'Absent', color: 'text-red-600' },
    { value: 'late', label: 'Late', color: 'text-yellow-600' },
    { value: 'half_day', label: 'Half Day', color: 'text-orange-600' },
    { value: 'sick_leave', label: 'Sick Leave', color: 'text-blue-600' },
    { value: 'casual_leave', label: 'Casual Leave', color: 'text-purple-600' },
    { value: 'official_duty', label: 'Official Duty', color: 'text-indigo-600' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Mark Staff Attendance
            </h2>
            <p className="text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSelectAllChange(option.value)}
                  className={`btn-outline btn-sm ${option.color}`}
                >
                  {getStatusIcon(option.value)}
                  <span className="ml-1">Mark All {option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Staff List */}
          <div className="space-y-4">
            {staff.map((member) => {
              const record = attendanceRecords.find(r => r.staffId === member.id) || {}
              
              return (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Staff Info */}
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.role?.replace('_', ' ')} • {member.employeeId}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <select
                        value={record.status || 'present'}
                        onChange={(e) => handleStatusChange(member.id, 'status', e.target.value)}
                        className="input input-sm w-full"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Check In Time */}
                    <div className="col-span-2">
                      <input
                        type="time"
                        value={record.checkInTime || '09:00'}
                        onChange={(e) => handleTimeChange(member.id, 'checkInTime', e.target.value)}
                        className="input input-sm w-full"
                        disabled={record.status === 'absent'}
                      />
                    </div>

                    {/* Check Out Time */}
                    <div className="col-span-2">
                      <input
                        type="time"
                        value={record.checkOutTime || '17:00'}
                        onChange={(e) => handleTimeChange(member.id, 'checkOutTime', e.target.value)}
                        className="input input-sm w-full"
                        disabled={record.status === 'absent'}
                      />
                    </div>

                    {/* Working Hours */}
                    <div className="col-span-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={record.workingHours || 0}
                        onChange={(e) => handleStatusChange(member.id, 'workingHours', parseFloat(e.target.value))}
                        className="input input-sm w-full"
                        disabled={record.status === 'absent'}
                      />
                    </div>

                    {/* Remarks */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={record.remarks || ''}
                        onChange={(e) => handleStatusChange(member.id, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        className="input input-sm w-full"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Column Headers (for reference) */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-blue-900">
              <div className="col-span-3">Staff Member</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Check In</div>
              <div className="col-span-2">Check Out</div>
              <div className="col-span-1">Hours</div>
              <div className="col-span-2">Remarks</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Marking Attendance...
              </>
            ) : (
              `Mark Attendance (${staff.length} staff)`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffAttendanceModal