import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  PencilIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/api'

function SchoolDetail() {
  const { id } = useParams()
  const [school, setSchool] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    fetchSchoolDetails()
    fetchSchoolStats()
  }, [id])

  const fetchSchoolDetails = async () => {
    try {
      const response = await api.get(`/schools/${id}`)
      setSchool(response.data.school)
    } catch (error) {
      console.error('Error fetching school details:', error)
    }
  }

  const fetchSchoolStats = async () => {
    try {
      const response = await api.get(`/schools/${id}/stats`)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching school stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubscription = async (subscriptionData) => {
    try {
      await api.put(`/schools/${id}/subscription`, subscriptionData)
      setShowSubscriptionModal(false)
      fetchSchoolDetails()
      fetchSchoolStats()
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  const handleUpdateSchool = async (schoolData) => {
    try {
      console.log('Sending school data:', schoolData)
      await api.put(`/schools/${id}`, schoolData)
      setShowEditModal(false)
      fetchSchoolDetails()
    } catch (error) {
      console.error('Error updating school:', error)
      console.error('Error response:', error.response?.data)
      throw error
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

  const isSubscriptionExpiring = () => {
    if (!school?.subscriptionExpiresAt) return false
    const expiryDate = new Date(school.subscriptionExpiresAt)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isSubscriptionExpired = () => {
    if (!school?.subscriptionExpiresAt) return false
    const expiryDate = new Date(school.subscriptionExpiresAt)
    const today = new Date()
    return expiryDate < today
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">School not found</h3>
        <p className="mt-1 text-sm text-gray-500">The school you're looking for doesn't exist.</p>
        <Link
          to="/app/schools"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Schools
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/app/schools"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
            <p className="text-gray-600">School Details & Management</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Manage Subscription
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit School
          </button>
        </div>
      </div>

      {/* Subscription Alert */}
      {(isSubscriptionExpiring() || isSubscriptionExpired()) && (
        <div className={`mb-6 p-4 rounded-md ${
          isSubscriptionExpired() ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex">
            <ExclamationTriangleIcon className={`h-5 w-5 ${
              isSubscriptionExpired() ? 'text-red-400' : 'text-yellow-400'
            }`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                isSubscriptionExpired() ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {isSubscriptionExpired() ? 'Subscription Expired' : 'Subscription Expiring Soon'}
              </h3>
              <p className={`text-sm ${
                isSubscriptionExpired() ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {isSubscriptionExpired() 
                  ? `This school's subscription expired on ${new Date(school.subscriptionExpiresAt).toLocaleDateString()}`
                  : `This school's subscription expires on ${new Date(school.subscriptionExpiresAt).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.name}</p>
                    <p className="text-sm text-gray-500">School Name</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.email}</p>
                    <p className="text-sm text-gray-500">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.phone || 'Not provided'}</p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.establishedYear || 'Not provided'}</p>
                    <p className="text-sm text-gray-500">Established Year</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {school.website ? (
                        <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {school.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-500">Website</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.address || 'Not provided'}</p>
                    <p className="text-sm text-gray-500">Address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats?.users?.student || 0}</p>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-xs text-gray-500">Limit: {school.maxStudents}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <AcademicCapIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats?.users?.teacher || 0}</p>
                <p className="text-sm text-gray-600">Teachers</p>
                <p className="text-xs text-gray-500">Limit: {school.maxTeachers}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{stats?.users?.parent || 0}</p>
                <p className="text-sm text-gray-600">Parents</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats?.users?.school_admin || 0}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {school.users?.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {(!school.users || school.users.length === 0) && (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.subscriptionStatus)}`}>
                  {school.subscriptionStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(school.subscriptionPlan)}`}>
                  {school.subscription?.name || school.subscriptionPlan}
                </span>
                {school.subscription && (
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{school.subscription.price}/{school.subscription.billingCycle}
                  </p>
                )}
              </div>
              {school.subscriptionExpiresAt && (
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(school.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Limits</p>
                <p className="text-sm font-medium text-gray-900">
                  {school.maxStudents} students, {school.maxTeachers} teachers
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Update Subscription
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Edit School Info
              </button>
              <Link
                to={`/app/schools/${id}/users`}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Manage Users
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Academic Year</p>
                <p className="font-medium">{school.academicYear}</p>
              </div>
              <div>
                <p className="text-gray-500">Timezone</p>
                <p className="font-medium">{school.timezone}</p>
              </div>
              <div>
                <p className="text-gray-500">Currency</p>
                <p className="font-medium">{school.currency}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{new Date(school.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSubscriptionModal && (
        <SubscriptionModal
          school={school}
          onClose={() => setShowSubscriptionModal(false)}
          onSubmit={handleUpdateSubscription}
        />
      )}
      
      {showEditModal && (
        <EditSchoolModal
          school={school}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateSchool}
        />
      )}
    </div>
  )
}

// Subscription Management Modal
function SubscriptionModal({ school, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    subscriptionStatus: school.subscriptionStatus,
    subscriptionId: school.subscriptionId,
    subscriptionExpiresAt: school.subscriptionExpiresAt ? 
      new Date(school.subscriptionExpiresAt).toISOString().split('T')[0] : '',
    maxStudents: school.maxStudents,
    maxTeachers: school.maxTeachers
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
      setErrors({ general: error.response?.data?.error || 'Failed to update subscription' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Manage Subscription</h2>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.subscriptionStatus}
              onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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
              Expires At
            </label>
            <input
              type="date"
              value={formData.subscriptionExpiresAt}
              onChange={(e) => setFormData({ ...formData, subscriptionExpiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              />
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
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit School Modal
function EditSchoolModal({ school, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: school.name || '',
    phone: school.phone || '',
    address: school.address || '',
    website: school.website || '',
    establishedYear: school.establishedYear || '',
    academicYear: school.academicYear || '',
    timezone: school.timezone || '',
    locale: school.locale || '',
    currency: school.currency || ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
        setErrors({ general: error.response?.data?.error || 'Failed to update school' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit School Information</h2>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="2024-25"
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Asia/Mumbai">Asia/Mumbai</option>
                <option value="Asia/Delhi">Asia/Delhi</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SchoolDetail