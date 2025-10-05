import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionInfo, getSchoolFeatures, FEATURE_NAMES } from '../utils/featureAccess';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CheckIcon, 
  XMarkIcon, 
  ArrowUpIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

function SubscriptionUpgrade() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availableSubscriptions, setAvailableSubscriptions] = useState([]);
  const [currentFeatures, setCurrentFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Get current subscription info
      const subInfo = await getSubscriptionInfo();
      setCurrentSubscription(subInfo);
      
      // Get current features
      const features = await getSchoolFeatures();
      setCurrentFeatures(features);
      
      // Get available subscription plans
      const response = await api.get('/subscriptions/public');
      setAvailableSubscriptions(response.data.subscriptions);
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (subscriptionId) => {
    try {
      setUpgrading(true);
      
      // Update school subscription
      await api.put(`/schools/${user.schoolId}/subscription`, {
        subscriptionId,
        subscriptionStatus: 'active'
      });
      
      // Refresh data
      await fetchSubscriptionData();
      
      alert('Subscription upgraded successfully!');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to upgrade subscription. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const isCurrentPlan = (planType) => {
    return currentSubscription?.planType === planType;
  };

  const isUpgrade = (subscription) => {
    const planOrder = { basic: 1, standard: 2, premium: 3 };
    const currentOrder = planOrder[currentSubscription?.planType] || 0;
    const targetOrder = planOrder[subscription.planType] || 0;
    return targetOrder > currentOrder;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upgrade Your Subscription
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Unlock more features and capabilities for your school
          </p>
        </div>

        {/* Current Plan Info */}
        {currentSubscription && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary-600">
                  {currentSubscription.name}
                </h3>
                <p className="text-gray-600">
                  ₹{currentSubscription.price}/{currentSubscription.billingCycle}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentSubscription.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {availableSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className={`relative bg-white rounded-lg shadow-sm border-2 ${
                  isCurrentPlan(subscription.planType)
                    ? 'border-primary-500'
                    : subscription.isPopular
                    ? 'border-blue-500'
                    : 'border-gray-200'
                } p-6`}
              >
                {/* Popular Badge */}
                {subscription.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan(subscription.planType) && (
                  <div className="absolute -top-3 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {subscription.name}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {subscription.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{subscription.price}
                    </span>
                    <span className="text-gray-600">/{subscription.billingCycle}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-2">
                    {Object.entries(subscription.features).map(([feature, enabled]) => (
                      <li key={feature} className="flex items-center">
                        {enabled ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-300 mr-2" />
                        )}
                        <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                          {FEATURE_NAMES[feature] || feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Students</p>
                      <p className="font-semibold">{subscription.maxStudents}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teachers</p>
                      <p className="font-semibold">{subscription.maxTeachers}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  {isCurrentPlan(subscription.planType) ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : isUpgrade(subscription) ? (
                    <button
                      onClick={() => handleUpgrade(subscription.id)}
                      disabled={upgrading}
                      className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {upgrading ? (
                        'Upgrading...'
                      ) : (
                        <>
                          <ArrowUpIcon className="h-4 w-4 inline mr-1" />
                          Upgrade to {subscription.name}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                    >
                      Downgrade Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        {currentFeatures && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              What you'll get with an upgrade
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-green-600 mb-3">
                  ✓ Currently Available Features
                </h3>
                <ul className="space-y-2">
                  {currentFeatures.features.available.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-900">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      {FEATURE_NAMES[feature] || feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-orange-600 mb-3">
                  ⚡ Unlock with Upgrade
                </h3>
                <ul className="space-y-2">
                  {currentFeatures.features.unavailable.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <ArrowUpIcon className="h-4 w-4 text-orange-500 mr-2" />
                      {FEATURE_NAMES[feature] || feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing the right plan?{' '}
            <a href="/contact" className="text-primary-600 hover:text-primary-500">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionUpgrade;