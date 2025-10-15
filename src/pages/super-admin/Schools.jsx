import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/api'

function Schools() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchSchools()
  }, [pagination.page, searchTerm, statusFilter])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      }

      const response = await api.get('/schools', { params })
      setSchools(response.data.schools)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchool = async (schoolData) => {
    try {
      await api.post('/schools', schoolData)
      setShowCreateModal(false)
      fetchSchools()
    } catch (error) {
      console.error('Error creating school:', error)
      throw error
    }
  }

  const handleDeactivateSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to deactivate this school? This will also deactivate all users.')) {
      try {
        await api.delete(`/schools/${schoolId}`)
        fetchSchools()
      } catch (error) {
        console.error('Error deactivating school:', error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      case 'standard':
        return 'bg-blue-100 text-blue-800'
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && schools.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Schools Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage all schools in the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span className="sm:inline">Add School</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <BuildingOfficeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Schools</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{schools.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <UserGroupIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Schools</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {schools.filter(s => s.subscriptionStatus === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
              <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Trial Schools</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {schools.filter(s => s.subscriptionStatus === 'trial').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {schools.filter(s => s.subscriptionStatus === 'suspended').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schools by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">Est. {school.establishedYear || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{school.email}</div>
                    <div className="text-sm text-gray-500">{school.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(school.subscriptionPlan)}`}>
                      {school.subscription?.name || school.subscriptionPlan}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {school.subscription && `₹${school.subscription.price}/${school.subscription.billingCycle}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {school.subscriptionExpiresAt ?
                        `Expires: ${new Date(school.subscriptionExpiresAt).toLocaleDateString()}` :
                        'No expiry'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Total: {school.userCounts?.total || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      S: {school.userCounts?.students || 0} | T: {school.userCounts?.teachers || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.subscriptionStatus)}`}>
                      {school.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/app/schools/${school.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeactivateSchool(school.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schools Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {schools.map((school) => (
          <div key={school.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{school.name}</div>
                  <div className="text-xs text-gray-500">Est. {school.establishedYear || 'N/A'}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/app/schools/${school.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDeactivateSchool(school.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">Contact:</span>
                <div className="flex-1">
                  <div className="text-xs text-gray-900">{school.email}</div>
                  <div className="text-xs text-gray-500">{school.phone || 'No phone'}</div>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">Plan:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(school.subscriptionPlan)}`}>
                  {school.subscription?.name || school.subscriptionPlan}
                </span>
              </div>

              <div className="flex items-start">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">Users:</span>
                <div className="text-xs text-gray-900 flex-1">
                  Total: {school.userCounts?.total || 0} (S: {school.userCounts?.students || 0} | T: {school.userCounts?.teachers || 0})
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.subscriptionStatus)}`}>
                  {school.subscriptionStatus}
                </span>
              </div>

              {school.subscriptionExpiresAt && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0">Expires:</span>
                  <span className="text-xs text-gray-900">
                    {new Date(school.subscriptionExpiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {schools.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schools found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new school.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === pagination.page
                        ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Create School Modal */}
      {showCreateModal && (
        <CreateSchoolModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSchool}
        />
      )}
    </div>
  )
}

// Create School Modal Component
function CreateSchoolModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    establishedYear: '',
    subscriptionId: '',
    maxStudents: 100,
    maxTeachers: 10
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/public')
      setSubscriptions(response.data.subscriptions)
      // Set default subscription if available
      if (response.data.subscriptions.length > 0) {
        const defaultSub = response.data.subscriptions.find(s => s.planType === 'basic') || response.data.subscriptions[0]
        setFormData(prev => ({
          ...prev,
          subscriptionId: defaultSub.id,
          maxStudents: defaultSub.maxStudents,
          maxTeachers: defaultSub.maxTeachers
        }))
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const handleSubscriptionChange = (subscriptionId) => {
    const selectedSubscription = subscriptions.find(s => s.id === subscriptionId)
    if (selectedSubscription) {
      setFormData(prev => ({
        ...prev,
        subscriptionId,
        maxStudents: selectedSubscription.maxStudents,
        maxTeachers: selectedSubscription.maxTeachers
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await onSubmit(formData)
    } catch (error) {
      if (error.response?.data?.details) {
        const newErrors = {}
        error.response.data.details.forEach(detail => {
          const field = detail.split(' ')[0].replace('"', '').replace('"', '')
          newErrors[field] = detail
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: error.response?.data?.error || 'Failed to create school' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Create New School</h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
                placeholder="example public school"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
                placeholder="example@gmail.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="9000000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Established Year
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="enter school address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Plan
              </label>
              <select
                value={formData.subscriptionId}
                onChange={(e) => handleSubscriptionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a plan</option>
                {subscriptions.map((subscription) => (
                  <option key={subscription.id} value={subscription.id}>
                    {subscription.name} - ₹{subscription.price}/{subscription.billingCycle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                min="10"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Set by selected plan</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Teachers
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxTeachers}
                onChange={(e) => setFormData({ ...formData, maxTeachers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Set by selected plan</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Schools