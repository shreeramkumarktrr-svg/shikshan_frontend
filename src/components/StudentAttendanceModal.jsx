import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { classesAPI } from '../utils/api'
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

function StudentAttendanceModal({ classId, date, onSave, onClose, isLoading }) {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [period, setPeriod] = useState(1)

  // Fetch students in the class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => classesAPI.getStudents(classId),
    enabled: !!classId,
    retry: 1,
    retryDelay: 1000
  })

  useEffect(() => {
    if (studentsData?.data) {
      // Safely get students array - handle different response structures
      const students = Array.isArray(studentsData.data.students) ? studentsData.data.students : 
                       Array.isArray(studentsData.data) ? studentsData.data : []
      
      // Initialize attendance records for all students
      const initialRecords = students.map(student => ({
        studentId: student.userId,
        status: 'present',
        period: period,
        remarks: ''
      }))
      setAttendanceRecords(initialRecords)
    }
  }, [studentsData, period])

  const handleStatusChange = (studentId, field, value) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, [field]: value }
          : record
      )
    )
  }

  const handleSelectAllChange = (status) => {
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, status }))
    )
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, period: newPeriod }))
    )
  }

  const handleSubmit = () => {
    // Validate required fields
    const invalidRecords = attendanceRecords.filter(record => !record.status)
    if (invalidRecords.length > 0) {
      alert('Please select status for all students')
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
      case 'excused':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'text-green-600' },
    { value: 'absent', label: 'Absent', color: 'text-red-600' },
    { value: 'late', label: 'Late', color: 'text-yellow-600' },
    { value: 'half_day', label: 'Half Day', color: 'text-orange-600' },
    { value: 'excused', label: 'Excused', color: 'text-blue-600' }
  ]

  if (studentsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-sm w-full mx-4">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-sm sm:text-base text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  const students = Array.isArray(studentsData?.data?.students) ? studentsData.data.students : 
                   Array.isArray(studentsData?.data) ? studentsData.data : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Mark Student Attendance
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Date: {new Date(date).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Controls */}
          <div className="mb-4 sm:mb-6 space-y-4">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period (Optional)
              </label>
              <select
                value={period}
                onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
                className="input w-full sm:w-48"
              >
                <option value="">Full Day</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSelectAllChange(option.value)}
                    className={`btn-outline btn-sm ${option.color} flex items-center justify-center w-full`}
                  >
                    {getStatusIcon(option.value)}
                    <span className="ml-1 text-xs sm:text-sm">Mark All {option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Students List */}
          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found in this class.</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block space-y-3">
                {students.map((student) => {
                  const record = attendanceRecords.find(r => r.studentId === student.userId) || {}
                  
                  return (
                    <div key={student.userId} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Student Info */}
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {student.user?.firstName} {student.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Roll: {student.rollNumber}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-3">
                          <select
                            value={record.status || 'present'}
                            onChange={(e) => handleStatusChange(student.userId, 'status', e.target.value)}
                            className="input input-sm w-full"
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status Icon */}
                        <div className="col-span-1 flex justify-center">
                          {getStatusIcon(record.status || 'present')}
                        </div>

                        {/* Remarks */}
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={record.remarks || ''}
                            onChange={(e) => handleStatusChange(student.userId, 'remarks', e.target.value)}
                            placeholder="Remarks (optional)"
                            className="input input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile View */}
              <div className="sm:hidden space-y-3">
                {students.map((student) => {
                  const record = attendanceRecords.find(r => r.studentId === student.userId) || {}
                  
                  return (
                    <div key={student.userId} className="border border-gray-200 rounded-lg p-3">
                      {/* Student Header */}
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {student.user?.firstName} {student.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.rollNumber}
                          </div>
                        </div>
                        <div className="ml-2">
                          {getStatusIcon(record.status || 'present')}
                        </div>
                      </div>

                      {/* Status Selection */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={record.status || 'present'}
                          onChange={(e) => handleStatusChange(student.userId, 'status', e.target.value)}
                          className="input input-sm w-full"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Remarks (Optional)
                        </label>
                        <input
                          type="text"
                          value={record.remarks || ''}
                          onChange={(e) => handleStatusChange(student.userId, 'remarks', e.target.value)}
                          placeholder="Add remarks..."
                          className="input input-sm w-full"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Summary */}
          {students.length > 0 && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 text-sm">
                {statusOptions.map(option => {
                  const count = attendanceRecords.filter(r => r.status === option.value).length
                  return (
                    <div key={option.value} className="text-center p-2 bg-white rounded">
                      <div className="font-medium text-blue-900">{count}</div>
                      <div className="text-blue-700 text-xs sm:text-sm">{option.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-outline w-full sm:w-auto order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary w-full sm:w-auto order-1 sm:order-2"
            disabled={isLoading || students.length === 0}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Marking Attendance...
              </>
            ) : (
              `Mark Attendance (${students.length} students)`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentAttendanceModal