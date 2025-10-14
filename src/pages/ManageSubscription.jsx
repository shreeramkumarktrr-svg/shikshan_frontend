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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
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
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Manage Subscription"
        subtitle="View your current subscription plan and features"
      />

      {subscription ? (
        <div className="space-y-6">
          {/* Current Plan Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <StarIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {subscription.planName}
                  </h2>
                  <p className="text-sm text-gray-500">Current Plan</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="font-semibold text-gray-900">₹{subscription.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Max Students</p>
                  <p className="font-semibold text-gray-900">{subscription.maxStudents}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Included Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                Included Features
              </h3>
              <div className="space-y-3">
                {subscription.features?.included?.length > 0 ? (
                  subscription.features.included.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                Upgrade for More Features
              </h3>
              <div className="space-y-3">
                {subscription.features?.missing?.length > 0 ? (
                  subscription.features.missing.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <XMarkIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{feature}</span>
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
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Ready to Upgrade?
                </h3>
                <p className="text-primary-700">
                  Unlock more features and increase your student capacity with our premium plans.
                </p>
              </div>
              <button
                disabled
                className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
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