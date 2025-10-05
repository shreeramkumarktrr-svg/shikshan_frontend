import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI, classesAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  DocumentArrowUpIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import UserModal from '../components/UserModal'
import UserDetailModal from '../components/UserDetailModal'
import PasswordModal from '../components/PasswordModal'
import BulkUserImport from '../components/BulkUserImport'
import ResponsiveCard, { CardGrid, StatCard } from '../components/ResponsiveCard'
import { FormButton } from '../components/ResponsiveForm'
import PageHeader from '../components/PageHeader'

function Students() {
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    active: '',
    classId: ''
  })
  const [page, setPage] = useState(1)

  // Fetch students
  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['students', filters, page],
    queryFn: () => usersAPI.getAll({ 
      ...filters, 
      role: 'student',
      page, 
      limit: 10 
    }),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000
  })

  // Fetch classes for filtering and assignment
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.getAll(),
    retry: 1,
    retryDelay: 1000
  })

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: (data) => usersAPI.create({ ...data, role: 'student' }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['students'])
      setIsCreateModalOpen(false)
      toast.success(`Student created successfully! Default password: ${response.data.defaultPassword}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create student')
    }
  })

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      setSelectedStudent(null)
      toast.success('Student updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update student')
    }
  })

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      toast.success('Student deactivated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to deactivate student')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.changePassword(id, data),
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      setSelectedStudent(null)
      toast.success('Password changed successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password')
    }
  })

  const handleCreateStudent = (studentData) => {
    createStudentMutation.mutate(studentData)
  }

  const handleUpdateStudent = (studentData) => {
    updateStudentMutation.mutate({
      id: selectedStudent.id,
      data: studentData
    })
  }

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to deactivate this student?')) {
      deleteStudentMutation.mutate(studentId)
    }
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setIsDetailModalOpen(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setIsCreateModalOpen(true)
  }

  const handleChangePassword = (student) => {
    setSelectedStudent(student)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordChange = (passwordData) => {
    changePasswordMutation.mutate({
      id: selectedStudent.id,
      data: passwordData
    })
  }

  const canManageStudents = hasRole(['school_admin', 'principal', 'teacher'])

  if (isLoading) return <LoadingSpinner />
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Backend Server Not Available</h3>
          <p className="text-sm text-gray-500 mb-4">
            The API server is not running. Please start the backend server.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  const students = studentsData?.data?.users || []
  const pagination = studentsData?.data?.pagination || {}
  const classes = Array.isArray(classesData?.data?.classes) ? classesData.data.classes : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Students Management"
        subtitle="Manage students and their parent information"
        actions={canManageStudents ? [
          {
            label: 'Bulk Import',
            variant: 'outline',
            icon: <DocumentArrowUpIcon className="h-5 w-5" />,
            onClick: () => setIsBulkImportOpen(true),
            primary: false
          },
          {
            label: 'Add Student',
            variant: 'primary',
            icon: <PlusIcon className="h-5 w-5" />,
            onClick: () => {
              setSelectedStudent(null)
              setIsCreateModalOpen(true)
            },
            primary: true
          }
        ] : []}
      />

      {/* Statistics */}
      <CardGrid columns={4}>
        <StatCard
          title="Total Students"
          value={students.length}
          icon={<UserIcon className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Active Students"
          value={students.filter(s => s.isActive).length}
          icon={<UserIcon className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Total Classes"
          value={classes.length}
          icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="With Parent Info"
          value={students.filter(s => s.parentContact).length}
          icon={<UserIcon className="h-6 w-6 text-orange-600" />}
        />
      </CardGrid>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="input w-40"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>

              <select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                className="input w-32"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="card-body p-0">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">
                {canManageStudents 
                  ? "Add your first student to get started."
                  : "No students match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class & Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.profilePic ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={student.profilePic}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-green-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.rollNumber && (
                              <div className="text-sm text-gray-500">
                                Roll: {student.rollNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.class ? (
                          <span className="badge badge-primary">
                            {student.class.name} - {student.class.section}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {student.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              {student.email}
                            </div>
                          )}
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {student.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.parentName ? (
                          <div className="space-y-1">
                            <div className="font-medium">{student.parentName}</div>
                            {student.parentContact && (
                              <div className="flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                {student.parentContact}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not Available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          student.isActive 
                            ? 'badge-success' 
                            : 'badge-danger'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {canManageStudents && (
                            <>
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit Student"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => handleChangePassword(student)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Change Password"
                              >
                                <KeyIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Deactivate Student"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <UserModal
          user={selectedStudent}
          onSave={selectedStudent ? handleUpdateStudent : handleCreateStudent}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedStudent(null)
          }}
          isLoading={createStudentMutation.isLoading || updateStudentMutation.isLoading}
          userType="student"
          classes={classes}
        />
      )}

      {isDetailModalOpen && selectedStudent && (
        <UserDetailModal
          user={selectedStudent}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedStudent(null)
          }}
          onEdit={canManageStudents ? () => {
            setIsDetailModalOpen(false)
            handleEditStudent(selectedStudent)
          } : null}
          onChangePassword={canManageStudents ? () => {
            setIsDetailModalOpen(false)
            handleChangePassword(selectedStudent)
          } : null}
          onDelete={canManageStudents ? () => {
            setIsDetailModalOpen(false)
            handleDeleteStudent(selectedStudent.id)
          } : null}
        />
      )}

      {isPasswordModalOpen && selectedStudent && (
        <PasswordModal
          user={selectedStudent}
          onSave={handlePasswordChange}
          onClose={() => {
            setIsPasswordModalOpen(false)
            setSelectedStudent(null)
          }}
          isLoading={changePasswordMutation.isLoading}
        />
      )}

      {isBulkImportOpen && (
        <BulkUserImport
          onClose={() => setIsBulkImportOpen(false)}
          userType="student"
          classes={classes}
        />
      )}
    </div>
  )
}

export default Students