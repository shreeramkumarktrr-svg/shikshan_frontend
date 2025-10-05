import { useState, useEffect } from 'react';
import { hasFeature, hasFeatures, getSubscriptionInfo, FEATURE_NAMES } from '../utils/featureAccess';
import { ExclamationTriangleIcon, LockClosedIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

/**
 * Component that conditionally renders children based on feature access
 * @param {Object} props
 * @param {string|Array} props.feature - Feature name or array of feature names to check
 * @param {React.ReactNode} props.children - Content to render if feature is available
 * @param {React.ReactNode} props.fallback - Content to render if feature is not available
 * @param {boolean} props.showUpgrade - Whether to show upgrade message
 * @param {string} props.mode - 'hide' (default) or 'disable' or 'show-message'
 */
function FeatureGuard({ 
  feature, 
  children, 
  fallback = null, 
  showUpgrade = true, 
  mode = 'hide' 
}) {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    checkFeatureAccess();
  }, [feature]);

  const checkFeatureAccess = async () => {
    try {
      setLoading(true);
      
      // Check if user is super admin - they have access to everything
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'super_admin') {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      
      let access = false;
      
      if (Array.isArray(feature)) {
        // Check multiple features - all must be available
        const featureResults = await hasFeatures(feature);
        access = feature.every(f => featureResults[f]);
      } else {
        // Check single feature
        access = await hasFeature(feature);
      }
      
      setHasAccess(access);
      
      if (!access && showUpgrade) {
        const subInfo = await getSubscriptionInfo();
        setSubscriptionInfo(subInfo);
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      // For super admin, default to true on error
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setHasAccess(user.role === 'super_admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (hasAccess) {
    return children;
  }

  // Feature not available
  if (mode === 'hide') {
    return fallback;
  }

  if (mode === 'disable') {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded">
          <LockClosedIcon className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    );
  }

  if (mode === 'show-message') {
    const featureNames = Array.isArray(feature) 
      ? feature.map(f => FEATURE_NAMES[f] || f).join(', ')
      : FEATURE_NAMES[feature] || feature;

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Feature Not Available
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {featureNames} {Array.isArray(feature) ? 'are' : 'is'} not included in your current subscription plan.
            </p>
            {subscriptionInfo && (
              <p className="text-xs text-yellow-600 mt-2">
                Current Plan: {subscriptionInfo.name}
              </p>
            )}
            {showUpgrade && (
              <button
                onClick={() => {
                  // Navigate to subscription upgrade page
                  window.location.href = '/app/subscription/upgrade';
                }}
                className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
              >
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return fallback;
}

/**
 * Hook for checking feature access in components
 * @param {string|Array} feature - Feature name or array of feature names
 * @returns {Object} { hasAccess, loading, subscriptionInfo }
 */
export function useFeatureAccess(feature) {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      
      // Check if user is super admin - they have access to everything
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'super_admin') {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      
      let access = false;
      
      if (Array.isArray(feature)) {
        const featureResults = await hasFeatures(feature);
        access = feature.every(f => featureResults[f]);
      } else {
        access = await hasFeature(feature);
      }
      
      setHasAccess(access);
      
      if (!access) {
        const subInfo = await getSubscriptionInfo();
        setSubscriptionInfo(subInfo);
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      // For super admin, default to true on error
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setHasAccess(user.role === 'super_admin');
    } finally {
      setLoading(false);
    }
  };

  return { hasAccess, loading, subscriptionInfo, recheckAccess: checkAccess };
}

/**
 * Component for displaying feature access denied message
 */
export function FeatureAccessDenied({ feature, onUpgrade }) {
  const featureName = FEATURE_NAMES[feature] || feature;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {featureName} is not available in your current subscription plan.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Upgrade Required
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  To access {featureName}, please upgrade your subscription plan.
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onUpgrade}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Upgrade Plan
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureGuard;