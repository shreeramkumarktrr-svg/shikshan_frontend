import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useSchool } from '../contexts/SchoolContext'
import { usersAPI, classesAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  UserCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import UserModal from '../components/UserModal'
import UserDetailModal from '../components/UserDetailModal'
import PasswordModal from '../components/PasswordModal'
import PageHeader from '../components/PageHeader'

function Teachers() {
  const { hasRole, user } = useAuth()
  const { selectedSchool } = useSchool()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [filters, setFilters] = useState({ search: '', active: '', hasClass: '' })
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // 🔹 Get School ID
  const getCurrentSchoolId = () => {
    if (user?.role === 'super_admin') {
      return selectedSchool?.id || user?.school?.id || null
    }
    return user?.schoolId || user?.school?.id || null
  }

  // 🔹 Fetch Teachers
  const { data: teachersData, isLoading, error } = useQuery({
    queryKey: ['teachers', filters, page, getCurrentSchoolId()],
    queryFn: () => {
      const params = { ...filters, role: 'teacher', page, limit: 10 }
      if (user?.role === 'super_admin' && getCurrentSchoolId()) {
        params.schoolId = getCurrentSchoolId()
      }
      return usersAPI.getAll(params)
    },
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000,
    enabled: !!getCurrentSchoolId()
  })

  // 🔹 Fetch Classes
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesAPI.getAll(),
    retry: 1,
    retryDelay: 1000
  })

  // 🔹 Fetch Teacher Stats (separate from filtered list)
  const { data: teacherStatsData } = useQuery({
    queryKey: ['teacher-stats', getCurrentSchoolId()],
    queryFn: () => {
      const params = { role: 'teacher', limit: 1000 } // Get all teachers for stats
      if (user?.role === 'super_admin' && getCurrentSchoolId()) {
        params.schoolId = getCurrentSchoolId()
      }
      return usersAPI.getAll(params)
    },
    enabled: !!getCurrentSchoolId()
  })

  // 🔹 Create Teacher
  const createTeacherMutation = useMutation({
    mutationFn: (data) => {
      const createData = { ...data, role: 'teacher' }
      // For super admin, add schoolId to the request body
      if (user?.role === 'super_admin' && getCurrentSchoolId()) {
        createData.schoolId = getCurrentSchoolId()
      }
      return usersAPI.create(createData)
    },
    onSuccess: (response) => {
      // Invalidate both teachers list and stats
      queryClient.invalidateQueries(['teachers'])
      queryClient.invalidateQueries(['teacher-stats'])
      queryClient.refetchQueries(['teachers'])
      setIsCreateModalOpen(false)
      toast.success(`Teacher created successfully! Default password: ${response.data.defaultPassword}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create teacher')
    }
  })

  // 🔹 Update Teacher
  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      // Invalidate both teachers list and stats
      queryClient.invalidateQueries(['teachers'])
      queryClient.invalidateQueries(['teacher-stats'])
      setSelectedTeacher(null)
      toast.success('Teacher updated successfully!')
    },
    onError: (error) => toast.error(error.response?.data?.error || 'Failed to update teacher')
  })

  // 🔹 Delete Teacher
  const deleteTeacherMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      // Invalidate both teachers list and stats
      queryClient.invalidateQueries(['teachers'])
      queryClient.invalidateQueries(['teacher-stats'])
      toast.success('Teacher deactivated successfully!')
    },
    onError: (error) => toast.error(error.response?.data?.error || 'Failed to deactivate teacher')
  })

  // 🔹 Change Password
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.changePassword(id, data),
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      setSelectedTeacher(null)
      toast.success('Password changed successfully!')
    },
    onError: (error) => toast.error(error.response?.data?.error || 'Failed to change password')
  })

  // 🔹 Handlers
  const handleCreateTeacher = (data) => createTeacherMutation.mutate(data)
  const handleUpdateTeacher = (data) => updateTeacherMutation.mutate({ id: selectedTeacher.id, data })
  const handleDeleteTeacher = (id) => {
    if (window.confirm('Are you sure you want to deactivate this teacher?')) deleteTeacherMutation.mutate(id)
  }
  const handleViewTeacher = (t) => { setSelectedTeacher(t); setIsDetailModalOpen(true) }
  const handleEditTeacher = (t) => { setSelectedTeacher(t); setIsCreateModalOpen(true) }
  const handleChangePassword = (t) => { setSelectedTeacher(t); setIsPasswordModalOpen(true) }
  const handlePasswordChange = (data) => changePasswordMutation.mutate({ id: selectedTeacher.id, data })

  const canManageTeachers = hasRole(['school_admin', 'principal'])
  const currentSchoolId = getCurrentSchoolId()

  // 🔹 Loading & Errors
  if (isLoading) return <LoadingSpinner />

  if (user?.role === 'super_admin' && !currentSchoolId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">Select a School</h3>
          <p className="text-gray-500 mb-4">Please select a school to manage teachers.</p>
          <button onClick={() => (window.location.href = '/app/schools')} className="bg-blue-600 text-white px-4 py-2 rounded">
            Go to Schools
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold text-red-600">Backend Not Reachable</h3>
          <p className="text-gray-500 mb-4">Please ensure the backend server is running.</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // 🔹 Data Extract
  const teachers = teachersData?.data?.users || []
  const pagination = teachersData?.data?.pagination || {}
  const classes = Array.isArray(classesData?.data?.classes) ? classesData.data.classes : []

  // Stats from separate unfiltered query
  const allTeachers = teacherStatsData?.data?.users || []
  const teachersCount = allTeachers.length
  const activeTeachersCount = allTeachers.filter(t => t.isActive).length

  // 🔹 UI Render
  return (
    <div className="space-y-6">
      {user?.role === 'super_admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800">Debug Info</h4>
          <div className="text-xs text-yellow-700 mt-2 space-y-1">
            <div>Current School ID: {currentSchoolId || 'None'}</div>
            <div>Selected School: {selectedSchool?.name || 'None'}</div>
            <div>Teachers Found: {teachersCount}</div>
          </div>
        </div>
      )}

      <PageHeader
        title="Teachers Management"
        subtitle="Manage all teachers and staff members"
        actions={
          canManageTeachers
            ? [
              {
                label: 'Add Teacher',
                variant: 'primary',
                icon: <PlusIcon className="h-5 w-5" />,
                onClick: () => {
                  setSelectedTeacher(null)
                  setIsCreateModalOpen(true)
                }
              }
            ]
            : []
        }
      />

      {/* 🔹 Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <UserCircleIcon className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Total Teachers</p>
            <p className="text-lg font-semibold">{teachersCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <AcademicCapIcon className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-lg font-semibold">
              {activeTeachersCount}
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 Search and Filters */}
      <div className="bg-white rounded-lg shadow">
        {/* Search Bar */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors relative ${showFilters
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FunnelIcon className="h-5 w-5" /> Filter
            {(filters.active || filters.hasClass) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {[filters.active, filters.hasClass].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.active}
                  onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Class Assignment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Assignment
                </label>
                <select
                  value={filters.hasClass}
                  onChange={(e) => setFilters({ ...filters, hasClass: e.target.value })}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Teachers</option>
                  <option value="true">With Class</option>
                  <option value="false">Without Class</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', active: '', hasClass: '' })}
                  className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 🔹 Teachers Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{`${t.firstName} ${t.lastName}`}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {t.isActive ? (
                    <span className="px-2 py-1 text-green-700 bg-green-100 rounded-full text-xs">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-red-700 bg-red-100 rounded-full text-xs">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => handleViewTeacher(t)} className="text-gray-500 hover:text-blue-600">
                    <EyeIcon className="h-5 w-5 inline" />
                  </button>
                  {canManageTeachers && (
                    <>
                      <button onClick={() => handleEditTeacher(t)} className="text-gray-500 hover:text-green-600">
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button onClick={() => handleChangePassword(t)} className="text-gray-500 hover:text-orange-600">
                        <KeyIcon className="h-5 w-5 inline" />
                      </button>
                      <button onClick={() => handleDeleteTeacher(t.id)} className="text-gray-500 hover:text-red-600">
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.currentPage || page} of {pagination.totalPages || 1}
        </span>
        <button
          disabled={page >= (pagination.totalPages || 1)}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* 🔹 Modals */}
      {isCreateModalOpen && (
        <UserModal
          user={selectedTeacher}
          onSave={selectedTeacher ? handleUpdateTeacher : handleCreateTeacher}
          onClose={() => setIsCreateModalOpen(false)}
          isLoading={createTeacherMutation.isLoading || updateTeacherMutation.isLoading}
          userType="teacher"
          classes={classes}
        />
      )}

      {isDetailModalOpen && (
        <UserDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} user={selectedTeacher} />
      )}

      {isPasswordModalOpen && (
        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordChange}
          user={selectedTeacher}
        />
      )}
    </div>
  )
}

export default Teachers