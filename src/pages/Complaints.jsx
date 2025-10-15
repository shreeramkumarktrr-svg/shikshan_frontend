import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { complaintsAPI } from '../utils/api'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import ComplaintModal from '../components/ComplaintModal'
import ComplaintDetailModal from '../components/ComplaintDetailModal'

function Complaints() {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch complaints
  const { data: complaintsData, isLoading, error } = useQuery({
    queryKey: ['complaints', currentPage, filters],
    queryFn: async () => {
      console.log('Query params:', { page: currentPage, limit: 10, ...filters })
      
      try {
        const result = await complaintsAPI.getAll({
          page: currentPage,
          limit: 10,
          ...filters
        })
        return result
      } catch (error) {
        console.error('Error response:', error.response)
        throw error
      }
    },
    onSuccess: (data) => {
      },
    onError: (error) => {
      },
    retry: false,
    refetchOnWindowFocus: false
  })

  // Fetch complaint stats
  const { data: statsData } = useQuery({
    queryKey: ['complaint-stats'],
    queryFn: () => complaintsAPI.getStats(),
    onSuccess: (data) => {
      },
    onError: (error) => {
      }
  })

  const complaints = complaintsData?.data?.data?.complaints || []
  const pagination = complaintsData?.data?.data?.pagination || {}
  
  console.log('complaintsData:', complaintsData)
  console.log('complaints array:', complaints)
  console.log('complaints length:', complaints.length)
  console.log('isLoading:', isLoading)
  console.log('error:', error)
  const stats = statsData?.data?.data || {}

  const handleCreateComplaint = () => {
    setShowCreateModal(true)
  }

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'closed':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCreateComplaint = hasRole(['student', 'parent'])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {hasRole(['student', 'parent']) 
              ? 'Track your complaints and their resolution progress'
              : 'Manage and resolve student complaints'
            }
          </p>
        </div>
        {canCreateComplaint && (
          <button
            onClick={handleCreateComplaint}
            className="btn-primary w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Complaint
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.totalComplaints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Open</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.openComplaints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">In Progress</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.inProgressComplaints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Resolved</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.resolvedComplaints || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400 hidden sm:block" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    className="input pl-10 w-full"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  Status
                </label>
                <select
                  className="input w-full"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  Category
                </label>
                <select
                  className="input w-full"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="discipline">Discipline</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="transport">Transport</option>
                  <option value="fee">Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  Priority
                </label>
                <select
                  className="input w-full"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Complaints</h3>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <LoadingSpinner centered size="md" className="py-8" />
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No complaints found</p>
            </div>
          ) : (
            <>
              {/* Mobile Layout */}
              <div className="sm:hidden">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{complaint.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ml-2 flex-shrink-0 ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(complaint.status)}
                            <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
                          </div>
                          <span className="capitalize">{complaint.category}</span>
                        </div>
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">
                            {complaint.complainant?.firstName} {complaint.complainant?.lastName}
                          </span>
                          <span className="ml-1 capitalize">
                            ({complaint.complainant?.role?.replace('_', ' ')})
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewComplaint(complaint)}
                          className="text-primary-600 hover:text-primary-900 text-xs font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Raised By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {complaint.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {complaint.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-gray-900">
                            {complaint.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(complaint.status)}
                            <span className="capitalize text-sm text-gray-900">
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900">
                              {complaint.complainant?.firstName} {complaint.complainant?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {complaint.complainant?.role?.replace('_', ' ')}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewComplaint(complaint)}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={currentPage === pagination.totalPages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ComplaintModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            // Invalidate all complaint-related queries
            queryClient.invalidateQueries({ queryKey: ['complaints'] })
            queryClient.invalidateQueries({ queryKey: ['complaint-stats'] })
            // Also refetch the current query
            queryClient.refetchQueries({ queryKey: ['complaints', currentPage, filters] })
          }}
        />
      )}

      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedComplaint(null)
          }}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] })
            queryClient.invalidateQueries({ queryKey: ['complaint-stats'] })
          }}
        />
      )}
    </div>
  )
}

export default Complaints