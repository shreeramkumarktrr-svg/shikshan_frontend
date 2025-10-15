import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  CheckIcon, 
  XMarkIcon, 
  CreditCardIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

function ManageSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [])

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get('/schools/subscription')

      setSubscription(response.data.subscription)
      setError(null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setError('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      case 'trial':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return <LoadingSpinner centered size="lg" />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Subscription</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View your current subscription plan and features
        </p>
      </div>

      {subscription ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Current Plan Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                  <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {subscription.planName}
                  </h2>
                  <p className="text-sm text-gray-500">Current Plan</p>
                </div>
              </div>
              <div className="flex justify-end sm:justify-start">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <CreditCardIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="font-semibold text-gray-900">₹{subscription.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Max Students</p>
                  <p className="font-semibold text-gray-900">{subscription.maxStudents}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Included Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Included Features</span>
              </h3>
              <div className="space-y-3">
                {subscription.features?.included?.length > 0 ? (
                  subscription.features.included.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 break-words">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No features data available
                  </div>
                )}
              </div>
            </div>

            {/* Missing Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <span>Upgrade for More Features</span>
              </h3>
              <div className="space-y-3">
                {subscription.features?.missing?.length > 0 ? (
                  subscription.features.missing.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <XMarkIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-500 break-words">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    All features included in your plan!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-2">
                  Ready to Upgrade?
                </h3>
                <p className="text-sm sm:text-base text-primary-700">
                  Unlock more features and increase your student capacity with our premium plans.
                </p>
              </div>
              <button
                disabled
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
              >
                Upgrade Plan (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-500 mb-4">
            Your school doesn't have an active subscription plan.
          </p>
          <button
            disabled
            className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Contact Support (Coming Soon)
          </button>
        </div>
      )}
    </div>
  )
}

export default ManageSubscription