import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AcademicCapIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { classesAPI, usersAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ClassModal from '../components/ClassModal'
import ClassDetailModal from '../components/ClassDetailModal'
import TimetableModal from '../components/TimetableModal'
import ManageSubjectsModal from '../components/ManageSubjectsModal'
import toast from 'react-hot-toast'

function Classes() {
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    grade: '',
    active: ''
  })
  const [page, setPage] = useState(1)

  // Fetch classes (filtered)
  const { data: classesData, isLoading, error } = useQuery({
    queryKey: ['classes', filters, page],
    queryFn: () => classesAPI.getAll({ 
      ...filters, 
      page, 
      limit: 10 
    }),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000
  })

  // Fetch class stats (unfiltered for statistics)
  const { data: classStatsData } = useQuery({
    queryKey: ['class-stats'],
    queryFn: () => classesAPI.getAll({ limit: 1000 }), // Get all classes for stats
    retry: 1,
    retryDelay: 1000
  })

  // Fetch teachers for class teacher assignment
  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => usersAPI.getAll({ role: 'teacher', limit: 100 }),
    retry: 1,
    retryDelay: 1000
  })

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: classesAPI.create,
    onSuccess: () => {
      // Invalidate both classes list and stats
      queryClient.invalidateQueries(['classes'])
      queryClient.invalidateQueries(['class-stats'])
      setIsCreateModalOpen(false)
      toast.success('Class created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create class')
    }
  })

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }) => classesAPI.update(id, data),
    onSuccess: () => {
      // Invalidate both classes list and stats
      queryClient.invalidateQueries(['classes'])
      queryClient.invalidateQueries(['class-stats'])
      setSelectedClass(null)
      toast.success('Class updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update class')
    }
  })

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: classesAPI.delete,
    onSuccess: () => {
      // Invalidate both classes list and stats
      queryClient.invalidateQueries(['classes'])
      queryClient.invalidateQueries(['class-stats'])
      toast.success('Class deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete class')
    }
  })

  // Update timetable mutation
  const updateTimetableMutation = useMutation({
    mutationFn: ({ id, data }) => classesAPI.updateTimetable(id, data),
    onSuccess: () => {
      // Invalidate both classes list and stats
      queryClient.invalidateQueries(['classes'])
      queryClient.invalidateQueries(['class-stats'])
      setIsTimetableModalOpen(false)
      setSelectedClass(null)
      toast.success('Timetable updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update timetable')
    }
  })

  const handleCreateClass = (classData) => {
    createClassMutation.mutate(classData)
  }

  const handleUpdateClass = (classData) => {
    updateClassMutation.mutate({
      id: selectedClass.id,
      data: classData
    })
  }

  const handleDeleteClass = (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      deleteClassMutation.mutate(classId)
    }
  }

  const handleViewClass = (cls) => {
    setSelectedClass(cls)
    setIsDetailModalOpen(true)
  }

  const handleEditClass = (cls) => {
    setSelectedClass(cls)
    setIsCreateModalOpen(true)
  }

  const handleManageTimetable = (cls) => {
    setSelectedClass(cls)
    setIsTimetableModalOpen(true)
  }

  const handleUpdateTimetable = (timetableData) => {
    updateTimetableMutation.mutate({
      id: selectedClass.id,
      data: { timetable: timetableData }
    })
  }

  const canManageClasses = hasRole(['school_admin', 'principal'])

  if (isLoading) return <LoadingSpinner centered size="lg" />
  
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

  const classes = Array.isArray(classesData?.data?.classes) ? classesData.data.classes : []
  const pagination = classesData?.data?.pagination || {}
  const teachers = Array.isArray(teachersData?.data?.users) ? teachersData.data.users : []
  
  // Stats from separate unfiltered query
  const allClasses = Array.isArray(classStatsData?.data?.classes) ? classStatsData.data.classes : []
  const totalClasses = allClasses.length
  const activeClasses = allClasses.filter(cls => cls.isActive).length
  const classesWithTeachers = allClasses.filter(cls => cls.classTeacher).length
  const totalStudents = allClasses.reduce((total, cls) => total + (cls.studentCount || 0), 0)

  // Get unique grades for filtering (from filtered results)
  const grades = [...new Set(classes.map(cls => cls.grade))].sort()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Classes Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage classes, sections, and timetables</p>
        </div>
        {canManageClasses && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsSubjectsModalOpen(true)}
              className="w-full sm:w-auto btn-outline flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base"
            >
              <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Manage Subjects</span>
            </button>
            <button
              onClick={() => {
                setSelectedClass(null)
                setIsCreateModalOpen(true)
              }}
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalClasses}</div>
            <div className="text-sm text-gray-500">Total Classes</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <AcademicCapIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{activeClasses}</div>
            <div className="text-sm text-gray-500">Active Classes</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <UserIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{classesWithTeachers}</div>
            <div className="text-sm text-gray-500">With Class Teachers</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <UserGroupIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
            <div className="text-sm text-gray-500">Total Students</div>
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
                  placeholder="Search classes..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                  className="input w-full sm:w-32"
                >
                  <option value="">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.active}
                  onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                  className="input w-full sm:w-32"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="card">
        <div className="card-body p-0">
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
              <p className="text-gray-500">
                {canManageClasses 
                  ? "Add your first class to get started."
                  : "No classes match your current filters."
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
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
                    {classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {cls.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Grade {cls.grade} - Section {cls.section}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cls.classTeacher ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                              </div>
                              <div className="text-gray-500">{cls.classTeacher.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-2" />
                            {cls.studentCount || 0} / {cls.maxStudents}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cls.room ? (
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                              {cls.room}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not Set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${
                            cls.isActive 
                              ? 'badge-success' 
                              : 'badge-danger'
                          }`}>
                            {cls.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewClass(cls)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => handleManageTimetable(cls)}
                              className="text-gray-400 hover:text-purple-600 transition-colors"
                              title="Manage Timetable"
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>

                            {canManageClasses && (
                              <>
                                <button
                                  onClick={() => handleEditClass(cls)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit Class"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete Class"
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

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-4 p-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{cls.name}</h3>
                        <p className="text-sm text-gray-500">Grade {cls.grade} - Section {cls.section}</p>
                      </div>
                      <span className={`badge text-xs ${
                        cls.isActive ? 'badge-success' : 'badge-danger'
                      }`}>
                        {cls.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Class Teacher: </span>
                        <span className="text-gray-900">
                          {cls.classTeacher 
                            ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                            : 'Not Assigned'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Students: </span>
                        <span className="text-gray-900">{cls.studentCount || 0} / {cls.maxStudents}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Room: </span>
                        <span className="text-gray-900">{cls.room || 'Not Set'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewClass(cls)}
                        className="btn-outline text-xs px-3 py-1 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleManageTimetable(cls)}
                        className="btn-outline text-xs px-3 py-1 flex items-center"
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Timetable
                      </button>
                      {canManageClasses && (
                        <>
                          <button
                            onClick={() => handleEditClass(cls)}
                            className="btn-outline text-xs px-3 py-1 flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="btn-danger text-xs px-3 py-1 flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-outline disabled:opacity-50 w-full sm:w-auto"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="btn-outline disabled:opacity-50 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <ClassModal
          key={`class-modal-${selectedClass?.id || 'new'}-${Date.now()}`}
          class={selectedClass}
          teachers={teachers}
          onSave={selectedClass ? handleUpdateClass : handleCreateClass}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedClass(null)
          }}
          isLoading={createClassMutation.isLoading || updateClassMutation.isLoading}
        />
      )}

      {isDetailModalOpen && selectedClass && (
        <ClassDetailModal
          class={selectedClass}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedClass(null)
          }}
          onEdit={canManageClasses ? () => {
            setIsDetailModalOpen(false)
            handleEditClass(selectedClass)
          } : null}
          onManageTimetable={() => {
            setIsDetailModalOpen(false)
            handleManageTimetable(selectedClass)
          }}
          onDelete={canManageClasses ? () => {
            setIsDetailModalOpen(false)
            handleDeleteClass(selectedClass.id)
          } : null}
        />
      )}

      {isTimetableModalOpen && selectedClass && (
        <TimetableModal
          class={selectedClass}
          onSave={handleUpdateTimetable}
          onClose={() => {
            setIsTimetableModalOpen(false)
            setSelectedClass(null)
          }}
          isLoading={updateTimetableMutation.isLoading}
        />
      )}

      {isSubjectsModalOpen && (
        <ManageSubjectsModal
          onClose={() => setIsSubjectsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Classes