import api from './api';

// Cache for school features to avoid repeated API calls
let featuresCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get school features from API or cache
 * @param {string} schoolId - Optional school ID (for super admin viewing specific school)
 * @returns {Promise<Object>} School features and subscription info
 */
export const getSchoolFeatures = async (schoolId = null) => {
  try {
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Determine which school ID to use
    let targetSchoolId = schoolId || user.schoolId;
    
    // Super admin users don't have schoolId, so they have access to all features
    if (user.role === 'super_admin' && !targetSchoolId) {
      // Return all features as available for super admin
      return {
        schoolId: null,
        subscriptionStatus: 'active',
        subscription: {
          name: 'Super Admin Access',
          planType: 'premium',
          price: 0,
          currency: 'INR',
          billingCycle: 'unlimited'
        },
        features: {
          available: Object.values(FEATURES),
          unavailable: [],
          all: Object.values(FEATURES).reduce((acc, feature) => {
            acc[feature] = true;
            return acc;
          }, {})
        },
        limits: {
          maxStudents: Infinity,
          maxTeachers: Infinity
        }
      };
    }
    
    if (!targetSchoolId) {
      console.error('User role:', user.role);
      console.error('User schoolId:', user.schoolId);
      
      // For non-super admin users without schoolId, return limited access
      if (user.role !== 'super_admin') {
        console.warn('⚠️ School user without schoolId - returning limited access');
        return {
          schoolId: null,
          subscriptionStatus: 'inactive',
          subscription: {
            name: 'No Subscription',
            planType: 'none',
            price: 0,
            currency: 'INR',
            billingCycle: 'none'
          },
          features: {
            available: ['dashboard', 'complaints'], // Only basic features
            unavailable: Object.values(FEATURES).filter(f => !['dashboard', 'complaints'].includes(f)),
            all: Object.values(FEATURES).reduce((acc, feature) => {
              acc[feature] = ['dashboard', 'complaints'].includes(feature);
              return acc;
            }, {})
          },
          limits: {
            maxStudents: 0,
            maxTeachers: 0
          }
        };
      }
      
      throw new Error('No school context available');
    }

    // Check if cache is still valid (use schoolId in cache key)
    const cacheKey = `features_${targetSchoolId}`;
    if (featuresCache && featuresCache.schoolId === targetSchoolId && 
        cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return featuresCache;
    }

    // Add cache-busting parameter to force fresh data
    const cacheBuster = Date.now();
    const response = await api.get(`/schools/${targetSchoolId}/features?_t=${cacheBuster}`);
    
    // Update cache
    featuresCache = response.data.features;
    cacheTimestamp = Date.now();
    
    return featuresCache;
  } catch (error) {
    console.error('Error fetching school features:', error);
    throw error;
  }
};

/**
 * Check if a specific feature is available for the current school
 * @param {string} featureName - Name of the feature to check
 * @param {string} schoolId - Optional school ID (for super admin)
 * @returns {Promise<boolean>} True if feature is available
 */
export const hasFeature = async (featureName, schoolId = null) => {
  try {
    const features = await getSchoolFeatures(schoolId);
    return features.features.available.includes(featureName);
  } catch (error) {
    console.error(`Error checking feature ${featureName}:`, error);
    // For super admin, default to true if there's an error
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'super_admin';
  }
};

/**
 * Check multiple features at once
 * @param {Array<string>} featureNames - Array of feature names to check
 * @param {string} schoolId - Optional school ID (for super admin)
 * @returns {Promise<Object>} Object with feature names as keys and boolean values
 */
export const hasFeatures = async (featureNames, schoolId = null) => {
  try {
    const features = await getSchoolFeatures(schoolId);
    const result = {};
    
    featureNames.forEach(featureName => {
      result[featureName] = features.features.available.includes(featureName);
    });
    
    return result;
  } catch (error) {
    console.error('Error checking multiple features:', error);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const result = {};
    featureNames.forEach(featureName => {
      // For super admin, default to true if there's an error
      result[featureName] = user.role === 'super_admin';
    });
    return result;
  }
};

/**
 * Get subscription info for the current school
 * @param {string} schoolId - Optional school ID (for super admin)
 * @returns {Promise<Object>} Subscription information
 */
export const getSubscriptionInfo = async (schoolId = null) => {
  try {
    const features = await getSchoolFeatures(schoolId);
    return {
      name: features.subscription.name,
      planType: features.subscription.planType,
      price: features.subscription.price,
      currency: features.subscription.currency,
      billingCycle: features.subscription.billingCycle,
      status: features.subscriptionStatus,
      limits: features.limits
    };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return null;
  }
};

/**
 * Clear the features cache (useful when subscription changes)
 */
export const clearFeaturesCache = () => {
  featuresCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Feature cache cleared');
};

/**
 * Force refresh features from server (bypasses cache)
 */
export const refreshFeatures = async (schoolId = null) => {
  clearFeaturesCache();
  return await getSchoolFeatures(schoolId);
};

/**
 * Debug function for browser console
 */
export const debugFeatureAccess = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'super_admin') {
    return;
  }
  
  if (!user.schoolId) {
    return;
  }
  
  try {
    clearFeaturesCache();
    const features = await getSchoolFeatures();
    
    // Test specific features
    const testFeatures = ['attendance', 'homework', 'events', 'reports'];
    for (const feature of testFeatures) {
      const hasAccess = await hasFeature(feature);
      }
    
  } catch (error) {
    }
};

// Make debug function available globally
if (typeof window !== 'undefined') {
  window.debugFeatureAccess = debugFeatureAccess;
  window.clearFeaturesCache = clearFeaturesCache;
  window.refreshFeatures = refreshFeatures;
}

/**
 * Feature names mapping for easy reference
 */
export const FEATURES = {
  // Core School Management Features (matching sidebar navigation)
  DASHBOARD: 'dashboard',
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  CLASSES: 'classes',
  ATTENDANCE: 'attendance',
  HOMEWORK: 'homework',
  EVENTS: 'events',
  COMPLAINTS: 'complaints',
  FEES: 'fees',
  FEE_MANAGEMENT: 'feeManagement',
  REPORTS: 'reports',
  // Additional Premium Features
  SMS_NOTIFICATIONS: 'smsNotifications',
  EMAIL_NOTIFICATIONS: 'emailNotifications',
  MOBILE_APP: 'mobileApp',
  CUSTOM_BRANDING: 'customBranding',
  API_ACCESS: 'apiAccess',
  ADVANCED_REPORTS: 'advancedReports',
  BULK_IMPORT: 'bulkImport',
  PARENT_PORTAL: 'parentPortal'
};

/**
 * Feature display names for UI
 */
export const FEATURE_NAMES = {
  // Core School Management Features (matching sidebar navigation)
  [FEATURES.DASHBOARD]: 'Dashboard',
  [FEATURES.TEACHERS]: 'Teachers Management',
  [FEATURES.STUDENTS]: 'Students Management',
  [FEATURES.CLASSES]: 'Classes Management',
  [FEATURES.ATTENDANCE]: 'Attendance Management',
  [FEATURES.HOMEWORK]: 'Homework & Assignments',
  [FEATURES.EVENTS]: 'Events & Calendar',
  [FEATURES.COMPLAINTS]: 'Complaints Management',
  [FEATURES.FEES]: 'Fee Management',
  [FEATURES.FEE_MANAGEMENT]: 'Fee Management',
  [FEATURES.REPORTS]: 'Reports & Analytics',
  // Additional Premium Features
  [FEATURES.SMS_NOTIFICATIONS]: 'SMS Notifications',
  [FEATURES.EMAIL_NOTIFICATIONS]: 'Email Notifications',
  [FEATURES.MOBILE_APP]: 'Mobile App Access',
  [FEATURES.CUSTOM_BRANDING]: 'Custom Branding',
  [FEATURES.API_ACCESS]: 'API Access',
  [FEATURES.ADVANCED_REPORTS]: 'Advanced Reports',
  [FEATURES.BULK_IMPORT]: 'Bulk Import',
  [FEATURES.PARENT_PORTAL]: 'Parent Portal'
};

/**
 * Handle feature access errors from API responses
 * @param {Object} error - Error object from API
 * @returns {Object} Formatted error info
 */
export const handleFeatureAccessError = (error) => {
  if (error.response?.data?.code === 'FEATURE_NOT_AVAILABLE') {
    return {
      type: 'feature_access',
      feature: error.response.data.feature,
      currentPlan: error.response.data.currentPlan,
      message: error.response.data.error,
      availableFeatures: error.response.data.availableFeatures
    };
  }
  
  if (error.response?.data?.code === 'SUBSCRIPTION_INACTIVE') {
    return {
      type: 'subscription_inactive',
      status: error.response.data.subscriptionStatus,
      message: error.response.data.error
    };
  }
  
  return {
    type: 'general',
    message: error.message || 'An error occurred'
  };
};