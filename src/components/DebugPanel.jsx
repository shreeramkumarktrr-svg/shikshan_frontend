import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

function DebugPanel() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: User info
      results.user = {
        status: 'success',
        data: {
          name: `${user?.firstName} ${user?.lastName}`,
          role: user?.role,
          schoolId: user?.schoolId || 'None (Super Admin)',
          email: user?.email
        }
      };

      // Test 2: Schools list
      try {
        const schoolsResponse = await api.get('/schools');
        results.schools = {
          status: 'success',
          data: {
            count: schoolsResponse.data.schools.length,
            schools: schoolsResponse.data.schools.map(s => ({
              id: s.id,
              name: s.name,
              subscription: s.subscription?.name || s.subscriptionPlan
            }))
          }
        };

        // Test 3: School details (if schools exist)
        if (schoolsResponse.data.schools.length > 0) {
          const testSchoolId = schoolsResponse.data.schools[0].id;
          
          try {
            const detailsResponse = await api.get(`/schools/${testSchoolId}`);
            results.schoolDetails = {
              status: 'success',
              data: {
                name: detailsResponse.data.school.name,
                email: detailsResponse.data.school.email,
                subscriptionStatus: detailsResponse.data.school.subscriptionStatus,
                userCounts: detailsResponse.data.school.userCounts
              }
            };
          } catch (error) {
            results.schoolDetails = {
              status: 'error',
              error: error.response?.data?.error || error.message
            };
          }

          // Test 4: School stats
          try {
            const statsResponse = await api.get(`/schools/${testSchoolId}/stats`);
            results.schoolStats = {
              status: 'success',
              data: statsResponse.data.stats
            };
          } catch (error) {
            results.schoolStats = {
              status: 'error',
              error: error.response?.data?.error || error.message
            };
          }

          // Test 5: School features
          try {
            const featuresResponse = await api.get(`/schools/${testSchoolId}/features`);
            results.schoolFeatures = {
              status: 'success',
              data: {
                subscription: featuresResponse.data.features.subscription.name,
                availableFeatures: featuresResponse.data.features.features.available,
                unavailableFeatures: featuresResponse.data.features.features.unavailable
              }
            };
          } catch (error) {
            results.schoolFeatures = {
              status: 'error',
              error: error.response?.data?.error || error.message
            };
          }
        }

      } catch (error) {
        results.schools = {
          status: 'error',
          error: error.response?.data?.error || error.message
        };
      }

      // Test 6: Subscription plans
      try {
        const subscriptionsResponse = await api.get('/subscriptions/public');
        results.subscriptions = {
          status: 'success',
          data: {
            count: subscriptionsResponse.data.subscriptions.length,
            plans: subscriptionsResponse.data.subscriptions.map(s => ({
              id: s.id,
              name: s.name,
              planType: s.planType,
              price: s.price
            }))
          }
        };
      } catch (error) {
        results.subscriptions = {
          status: 'error',
          error: error.response?.data?.error || error.message
        };
      }

    } catch (error) {
      results.general = {
        status: 'error',
        error: error.message
      };
    }

    setDebugInfo(results);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runDebugTests();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please log in to run debug tests</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Debug Panel</h2>
        <button
          onClick={runDebugTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Debug Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(debugInfo).map(([testName, result]) => (
          <div key={testName} className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                {result.status}
              </span>
            </div>
            
            {result.status === 'success' ? (
              <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(debugInfo).length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Click "Run Debug Tests" to start debugging
        </div>
      )}
    </div>
  );
}

export default DebugPanel;