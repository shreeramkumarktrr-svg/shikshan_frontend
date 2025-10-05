import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI, classesAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import UserModal from '../components/UserModal'
import UserDetailModal from '../components/UserDetailModal'
import PasswordModal from '../components/PasswordModal'
import ResponsiveCard, { CardGrid, StatCard } from '../components/ResponsiveCard'
import { FormButton } from '../components/ResponsiveForm'
import PageHeader from '../components/PageHeader'

function Teachers() {
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    active: '',
    hasClass: ''
  })
  const [page, setPage] = useState(1)

  // Fetch teachers
  const { data: teachersData, isLoading, error } = useQuery({
    queryKey: ['teachers', filters, page],
    queryFn: () => usersAPI.getAll({ 
      ...filters, 
      role: 'teacher',
      page, 
      limit: 10 
    }),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000
  })

  // Fetch classes for assignment
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.getAll(),
    retry: 1,
    retryDelay: 1000
  })

  // Create teacher mutation
  const createTeacherMutation = useMutation({
    mutationFn: (data) => usersAPI.create({ ...data, role: 'teacher' }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['teachers'])
      setIsCreateModalOpen(false)
      toast.success(`Teacher created successfully! Default password: ${response.data.defaultPassword}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create teacher')
    }
  })

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teachers'])
      setSelectedTeacher(null)
      toast.success('Teacher updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update teacher')
    }
  })

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['teachers'])
      toast.success('Teacher deactivated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to deactivate teacher')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.changePassword(id, data),
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      setSelectedTeacher(null)
      toast.success('Password changed successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password')
    }
  })

  const handleCreateTeacher = (teacherData) => {
    createTeacherMutation.mutate(teacherData)
  }

  const handleUpdateTeacher = (teacherData) => {
    updateTeacherMutation.mutate({
      id: selectedTeacher.id,
      data: teacherData
    })
  }

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to deactivate this teacher?')) {
      deleteTeacherMutation.mutate(teacherId)
    }
  }

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailModalOpen(true)
  }

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setIsCreateModalOpen(true)
  }

  const handleChangePassword = (teacher) => {
    setSelectedTeacher(teacher)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordChange = (passwordData) => {
    changePasswordMutation.mutate({
      id: selectedTeacher.id,
      data: passwordData
    })
  }

  const canManageTeachers = hasRole(['school_admin', 'principal'])

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

  const teachers = teachersData?.data?.users || []
  const pagination = teachersData?.data?.pagination || {}
  const classes = Array.isArray(classesData?.data?.classes) ? classesData.data.classes : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Teachers Management"
        subtitle="Manage teachers and staff members"
        actions={canManageTeachers ? [
          {
            label: 'Add Teacher',
            variant: 'primary',
            icon: <PlusIcon className="h-5 w-5" />,
            onClick: () => {
              setSelectedTeacher(null)
              setIsCreateModalOpen(true)
            },
            primary: true
          }
        ] : []}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{teachers.length}</div>
            <div className="text-sm text-gray-500">Total Teachers</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <UserCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {teachers.filter(t => t.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Teachers</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {teachers.filter(t => t.classTeacher).length}
            </div>
            <div className="text-sm text-gray-500">Class Teachers</div>
          </div>
        </div>
      </div>

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
                  placeholder="Search teachers..."
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
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                className="input w-32"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <select
                value={filters.hasClass}
                onChange={(e) => setFilters({ ...filters, hasClass: e.target.value })}
                className="input w-40"
              >
                <option value="">All Teachers</option>
                <option value="true">Class Teachers</option>
                <option value="false">Subject Teachers</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers List */}
      <div className="card">
        <div className="card-body p-0">
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-500">
                {canManageTeachers 
                  ? "Add your first teacher to get started."
                  : "No teachers match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {teacher.profilePic ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={teacher.profilePic}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            {teacher.employeeId && (
                              <div className="text-sm text-gray-500">
                                ID: {teacher.employeeId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {teacher.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              {teacher.email}
                            </div>
                          )}
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {teacher.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.classTeacher ? (
                          <span className="badge badge-primary">
                            Class Teacher - {teacher.classTeacher}
                          </span>
                        ) : (
                          <span className="text-gray-400">Subject Teacher</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          teacher.isActive 
                            ? 'badge-success' 
                            : 'badge-danger'
                        }`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewTeacher(teacher)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {canManageTeachers && (
                            <>
                              <button
                                onClick={() => handleEditTeacher(teacher)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit Teacher"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => handleChangePassword(teacher)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Change Password"
                              >
                                <KeyIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Deactivate Teacher"
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
          user={selectedTeacher}
          onSave={selectedTeacher ? handleUpdateTeacher : handleCreateTeacher}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedTeacher(null)
          }}
          isLoading={createTeacherMutation.isLoading || updateTeacherMutation.isLoading}
          userType="teacher"
          classes={classes}
        />
      )}

      {isDetailModalOpen && selectedTeacher && (
        <UserDetailModal
          user={selectedTeacher}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedTeacher(null)
          }}
          onEdit={canManageTeachers ? () => {
            setIsDetailModalOpen(false)
            handleEditTeacher(selectedTeacher)
          } : null}
          onChangePassword={canManageTeachers ? () => {
            setIsDetailModalOpen(false)
            handleChangePassword(selectedTeacher)
          } : null}
          onDelete={canManageTeachers ? () => {
            setIsDetailModalOpen(false)
            handleDeleteTeacher(selectedTeacher.id)
          } : null}
        />
      )}

      {isPasswordModalOpen && selectedTeacher && (
        <PasswordModal
          user={selectedTeacher}
          onSave={handlePasswordChange}
          onClose={() => {
            setIsPasswordModalOpen(false)
            setSelectedTeacher(null)
          }}
          isLoading={changePasswordMutation.isLoading}
        />
      )}
    </div>
  )
}

export default Teachers