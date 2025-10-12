import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import api from '../../utils/api'

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions')
      setSubscriptions(response.data.subscriptions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setLoading(false)
    }
  }

  const handleCreateSubscription = async (subscriptionData) => {
    try {
      await api.post('/subscriptions', subscriptionData)
      setShowModal(false)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  const handleUpdateSubscription = async (subscriptionData) => {
    try {
      console.log('Update data:', JSON.stringify(subscriptionData, null, 2))
      
      // Validate that planType is not included in update data
      if (subscriptionData.planType) {
        console.warn('planType found in update data - this should not happen!')
        delete subscriptionData.planType;
      }
      
      const response = await api.put(`/subscriptions/${editingSubscription.id}`, subscriptionData)
      setShowModal(false)
      setEditingSubscription(null)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error updating subscription:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      console.error('Request URL:', `/subscriptions/${editingSubscription.id}`)
      throw error
    }
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this subscription plan?')) {
      try {
        await api.delete(`/subscriptions/${id}`)
        fetchSubscriptions()
      } catch (error) {
        console.error('Error deleting subscription:', error)
        alert(error.response?.data?.error || 'Failed to delete subscription')
      }
    }
  }

  const handleViewAnalytics = (subscription) => {
    setSelectedSubscription(subscription)
    setShowAnalytics(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <button
          onClick={() => {
            setEditingSubscription(null)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className={`bg-white rounded-lg shadow-md p-6 border-2 ${
            subscription.isPopular ? 'border-primary-500 relative' : 'border-gray-200'
          }`}>
            {subscription.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{subscription.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{subscription.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewAnalytics(subscription)}
                  className="text-green-600 hover:text-green-800"
                  title="View Analytics"
                >
                  <ChartBarIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(subscription)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(subscription.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Deactivate"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{subscription.price}</span>
              <span className="text-gray-600">/{subscription.billingCycle}</span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Students: {subscription.maxStudents}</span>
                <span>Teachers: {subscription.maxTeachers}</span>
              </div>
              <div className="text-sm text-gray-600">
                Classes: {subscription.maxClasses} | Trial: {subscription.trialDays} days
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Core Features:</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {/* Show core school management features first */}
                {['dashboard', 'teachers', 'students', 'classes', 'attendance', 'homework', 'events', 'complaints', 'fees', 'reports'].slice(0, 6).map((key) => {
                  const value = subscription.features[key];
                  return (
                    <div key={key} className={`flex items-center ${value ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  );
                })}
              </div>
              {/* Show premium features count */}
              {Object.entries(subscription.features).filter(([key, value]) => 
                !['dashboard', 'teachers', 'students', 'classes', 'attendance', 'homework', 'events', 'complaints', 'fees', 'reports'].includes(key) && value
              ).length > 0 && (
                <div className="text-xs text-blue-600 mt-2">
                  + {Object.entries(subscription.features).filter(([key, value]) => 
                    !['dashboard', 'teachers', 'students', 'classes', 'attendance', 'homework', 'events', 'complaints', 'fees', 'reports'].includes(key) && value
                  ).length} premium features
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                subscription.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscription.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{subscription.schoolCount || 0} schools</div>
                <div className="text-xs text-gray-500">{subscription.activeSchoolCount || 0} active</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Modal */}
      {showModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          onClose={() => {
            setShowModal(false)
            setEditingSubscription(null)
          }}
          onSubmit={editingSubscription ? handleUpdateSubscription : handleCreateSubscription}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && selectedSubscription && (
        <AnalyticsModal
          subscription={selectedSubscription}
          onClose={() => {
            setShowAnalytics(false)
            setSelectedSubscription(null)
          }}
        />
      )}
    </div>
  )
}

export default Subscriptions;
//Subscription Modal Component
function SubscriptionModal({ subscription, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    description: subscription?.description || '',
    planType: subscription?.planType || 'basic',
    price: subscription?.price || 0,
    currency: subscription?.currency || 'INR',
    billingCycle: subscription?.billingCycle || 'monthly',
    trialDays: subscription?.trialDays || 30,
    maxStudents: subscription?.maxStudents || 100,
    maxTeachers: subscription?.maxTeachers || 10,
    maxClasses: subscription?.maxClasses || 20,
    isActive: subscription?.isActive ?? true,
    isPopular: subscription?.isPopular || false,
    sortOrder: subscription?.sortOrder || 0,
    features: subscription?.features || {
      // Core School Management Features (matching sidebar navigation)
      dashboard: true,
      teachers: true,
      students: true,
      classes: true,
      attendance: true,
      homework: true,
      events: true,
      complaints: true,
      fees: true,
      reports: true,
      // Additional Premium Features
      smsNotifications: false,
      emailNotifications: true,
      mobileApp: false,
      customBranding: false,
      apiAccess: false,
      advancedReports: false,
      bulkImport: false,
      parentPortal: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      
      console.log('Submitting subscription data:', JSON.stringify(formData, null, 2))
      
      // Validate required fields on frontend
      if (!formData.name || formData.name.length < 2) {
        throw new Error('Name must be at least 2 characters long')
      }
      if (formData.price < 0) {
        throw new Error('Price must be non-negative')
      }
      if (!formData.currency || formData.currency.length !== 3) {
        throw new Error('Currency must be 3 characters long')
      }
      
      // Sanitize data types to ensure they match backend expectations
      const sanitizedData = {
        ...formData,
        price: parseFloat(formData.price),
        trialDays: parseInt(formData.trialDays),
        maxStudents: parseInt(formData.maxStudents),
        maxTeachers: parseInt(formData.maxTeachers),
        maxClasses: parseInt(formData.maxClasses),
        sortOrder: parseInt(formData.sortOrder),
        isActive: Boolean(formData.isActive),
        isPopular: Boolean(formData.isPopular)
      }
      
      // Remove planType from update data (it's not allowed to be changed)
      if (subscription) {
        delete sanitizedData.planType;
        console.log('Editing existing subscription - planType excluded from update');
      }
      
      console.log('Sanitized data:', JSON.stringify(sanitizedData, null, 2))
      
      await onSubmit(sanitizedData)
    } catch (error) {
      console.error('Subscription submission error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.data?.details) {
        const newErrors = {}
        error.response.data.details.forEach(detail => {
          const field = detail.split(' ')[0].replace(/"/g, '')
          newErrors[field] = detail
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: error.response?.data?.error || error.message || 'Failed to save subscription' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureChange = (feature, value) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: value
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {subscription ? 'Edit Subscription' : 'Create Subscription'}
        </h2>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                placeholder="Enter plan name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Type *
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                disabled={!!subscription} // Don't allow changing plan type for existing subscriptions
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter description"            
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
                placeholder="Enter price"
              />
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
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Days
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                min="1"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Classes
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxClasses}
                onChange={(e) => setFormData({ ...formData, maxClasses: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            
            {/* Core School Management Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Core School Management Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-blue-50 rounded-lg">
                {['dashboard', 'teachers', 'students', 'classes', 'attendance', 'homework', 'events', 'complaints', 'fees', 'reports'].map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features[feature] || false}
                      onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Premium Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-yellow-50 rounded-lg">
                {['smsNotifications', 'emailNotifications', 'mobileApp', 'customBranding', 'apiAccess', 'advancedReports', 'bulkImport', 'parentPortal'].map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features[feature] || false}
                      onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Popular Plan</span>
              </label>
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
              {loading ? 'Saving...' : (subscription ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Analytics Modal Component
function AnalyticsModal({ subscription, onClose }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [subscription.id])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/subscriptions/${subscription.id}/analytics`)
      setAnalytics(response.data.analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Analytics - {subscription.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* School Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">School Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics?.schoolStats || {}).map(([status, count]) => (
                  <div key={status} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{analytics?.revenue?.total?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.revenue?.totalPayments || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{Math.round(analytics?.revenue?.total / Math.max(analytics?.revenue?.totalPayments, 1) || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Payment</div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Trend */}
            {analytics?.revenue?.monthly?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {analytics.revenue.monthly.map((month, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">₹{parseFloat(month.revenue).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{month.payments} payments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}