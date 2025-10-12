import api from './api';

// Cache for school features to avoid repeated API calls
let featuresCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check student-specific permissions for features and actions
 * @param {string} featureName - Name of the feature to check
 * @param {string} action - Action type (view, create, update, delete)
 * @returns {boolean} True if student has permission
 */
export const hasStudentPermission = (featureName, action = 'view') => {
  const studentPermissions = {
    // 1. Dashboard (Student specific) - Full access
    dashboard: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    
    // 2. Teachers (Not visible at all) - No access
    teachers: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 3. Students (Not visible at all) - No access
    students: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 4. Classes (Not visible at all) - No access
    classes: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 5. Attendance (Not visible at all) - No access
    attendance: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 6. Homework (can see their homework) - Read only for their own
    homework: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    
    // 7. Events (can see the school wide events) - Read only
    events: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    
    // 8. Complaints (can create/modify and overview the complaints) - Limited access
    complaints: {
      view: true,
      create: true,
      update: true,
      delete: false
    },
    
    // 9. Fees (Can see their fees generated for their class) - Read only for their own
    fees: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    feeManagement: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 10. Reports (Not visible at all) - No access
    reports: {
      view: false,
      create: false,
      update: false,
      delete: false
    }
  };
  
  const featurePermissions = studentPermissions[featureName];
  if (!featurePermissions) {
    return false; // Feature not defined for students
  }
  
  return featurePermissions[action] || false;
};

/**
 * Check teacher-specific permissions for features and actions
 * @param {string} featureName - Name of the feature to check
 * @param {string} action - Action type (view, create, update, delete)
 * @returns {boolean} True if teacher has permission
 */
export const hasTeacherPermission = (featureName, action = 'view') => {
  const teacherPermissions = {
    // 1. Dashboard (Teacher specific) - Full access
    dashboard: {
      view: true,
      create: true,
      update: true,
      delete: true
    },
    
    // 2. Teachers (can't add/update teachers) - Read only
    teachers: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    
    // 3. Students (can do everything) - Full access
    students: {
      view: true,
      create: true,
      update: true,
      delete: true
    },
    
    // 4. Classes (can't add/update classes) - Read only
    classes: {
      view: true,
      create: false,
      update: false,
      delete: false
    },
    
    // 5. Attendance (can mark their own and all students attendance) - Full access
    attendance: {
      view: true,
      create: true,
      update: true,
      delete: true
    },
    
    // 6. Homework (can do everything) - Full access
    homework: {
      view: true,
      create: true,
      update: true,
      delete: true
    },
    
    // 7. Events (can do everything) - Full access
    events: {
      view: true,
      create: true,
      update: true,
      delete: true
    },
    
    // 8. Complaints (only review and update complaints) - Limited access
    complaints: {
      view: true,
      create: false,
      update: true,
      delete: false
    },
    
    // 9. Fees (Not visible at all) - No access
    fees: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    feeManagement: {
      view: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 10. Reports (can see everything excluding fees and financial related data) - Read only
    reports: {
      view: true,
      create: false,
      update: false,
      delete: false
    }
  };
  
  const featurePermissions = teacherPermissions[featureName];
  if (!featurePermissions) {
    return false; // Feature not defined for teachers
  }
  
  return featurePermissions[action] || false;
};

/**
 * Check if teacher can access a specific report type
 * @param {string} reportType - Type of report (attendance, academic, financial, etc.)
 * @returns {boolean} True if teacher can access this report type
 */
export const hasTeacherReportAccess = (reportType) => {
  const allowedReports = [
    'attendance',
    'academic',
    'student_performance',
    'homework',
    'events',
    'complaints',
    'class_summary',
    'student_list'
  ];
  
  const restrictedReports = [
    'financial',
    'fees',
    'payments',
    'revenue',
    'expenses'
  ];
  
  return allowedReports.includes(reportType) && !restrictedReports.includes(reportType);
};

/**
 * Check if user can access financial reports
 * @param {string} userRole - User role
 * @returns {boolean} True if user can access financial reports
 */
export const canAccessFinancialReports = (userRole) => {
  const authorizedRoles = ['school_admin', 'principal', 'finance_officer', 'super_admin'];
  return authorizedRoles.includes(userRole);
};

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
 * Check if a specific feature is available for the current school and user role
 * @param {string} featureName - Name of the feature to check
 * @param {string} schoolId - Optional school ID (for super admin)
 * @param {string} action - Optional action type (view, create, update, delete)
 * @returns {Promise<boolean>} True if feature is available
 */
export const hasFeature = async (featureName, schoolId = null, action = 'view') => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return true;
    }
    
    // Check if the feature is available in the school's subscription
    const features = await getSchoolFeatures(schoolId);
    const hasSubscriptionAccess = features.features.available.includes(featureName);
    
    if (!hasSubscriptionAccess) {
      return false;
    }
    
    // Apply role-based permissions for teachers
    if (user.role === 'teacher') {
      // Special case: Teachers have NO access to fees at all
      if (featureName === 'fees' || featureName === 'feeManagement') {
        return false;
      }
      
      return hasTeacherPermission(featureName, action);
    }
    
    // Apply role-based permissions for students
    if (user.role === 'student') {
      return hasStudentPermission(featureName, action);
    }
    
    // For other roles, if they have subscription access, they have full access
    return true;
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
  window.hasTeacherPermission = hasTeacherPermission;
  window.hasStudentPermission = hasStudentPermission;
  window.hasTeacherReportAccess = hasTeacherReportAccess;
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
  
  if (error.response?.data?.code === 'TEACHER_PERMISSION_DENIED') {
    return {
      type: 'teacher_permission',
      feature: error.response.data.feature,
      action: error.response.data.action,
      message: error.response.data.error || 'Teachers do not have permission for this action'
    };
  }
  
  return {
    type: 'general',
    message: error.message || 'An error occurred'
  };
};