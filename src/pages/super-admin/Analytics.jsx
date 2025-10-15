import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/api'

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch data from multiple endpoints
      const [schoolsRes, paymentsRes, subscriptionsRes] = await Promise.all([
        api.get('/schools'),
        api.get('/payments/analytics/overview', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        api.get('/subscriptions')
      ])

      const schools = schoolsRes.data.schools
      const paymentAnalytics = paymentsRes.data.analytics
      const subscriptions = subscriptionsRes.data.subscriptions

      // Calculate overview metrics
      const totalSchools = schools.length
      const activeSchools = schools.filter(s => s.subscriptionStatus === 'active').length
      const trialSchools = schools.filter(s => s.subscriptionStatus === 'trial').length
      const totalUsers = schools.reduce((sum, school) => sum + (school.userCounts?.total || 0), 0)

      // Calculate subscription breakdown
      const subscriptionBreakdown = subscriptions.map(sub => ({
        plan: sub.name,
        count: sub.schoolCount || 0,
        percentage: totalSchools > 0 ? ((sub.schoolCount || 0) / totalSchools * 100).toFixed(1) : 0
      }))

      // Get top schools by user count (since we don't have revenue per school yet)
      const topSchools = schools
        .sort((a, b) => (b.userCounts?.total || 0) - (a.userCounts?.total || 0))
        .slice(0, 5)
        .map(school => ({
          name: school.name,
          users: school.userCounts?.total || 0,
          plan: school.subscriptionPlan,
          status: school.subscriptionStatus
        }))

      setAnalytics({
        overview: {
          totalSchools,
          totalRevenue: paymentAnalytics.revenue?.total || 0,
          activeSubscriptions: activeSchools,
          totalUsers,
          trialSchools,
          growthMetrics: {
            schoolsGrowth: 0, // TODO: Calculate based on historical data
            revenueGrowth: 0,
            subscriptionsGrowth: 0,
            usersGrowth: 0
          }
        },
        revenueData: paymentAnalytics.monthlyTrend || [],
        subscriptionBreakdown,
        topSchools,
        paymentStats: paymentAnalytics.statusBreakdown || {}
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, growth, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-xs text-gray-500 ml-1 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-primary-100 rounded-full flex-shrink-0 ml-3">
          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary-600" />
        </div>
      </div>
    </div>
  )

  if (loading) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of platform performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Schools"
          value={analytics.overview.totalSchools}
          icon={BuildingOfficeIcon}
          growth={analytics.overview.growthMetrics.schoolsGrowth}
        />
        <StatCard
          title="Total Revenue"
          value={analytics.overview.totalRevenue}
          icon={CurrencyDollarIcon}
          growth={analytics.overview.growthMetrics.revenueGrowth}
          prefix="₹"
        />
        <StatCard
          title="Active Subscriptions"
          value={analytics.overview.activeSubscriptions}
          icon={ChartBarIcon}
          growth={analytics.overview.growthMetrics.subscriptionsGrowth}
        />
        <StatCard
          title="Trial Schools"
          value={analytics.overview.trialSchools}
          icon={DocumentTextIcon}
          growth={analytics.overview.growthMetrics.usersGrowth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          {analytics.revenueData.length > 0 ? (
            <div className="space-y-3">
              {analytics.revenueData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-xs sm:text-sm font-medium">
                    {new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-semibold">₹{parseFloat(item.revenue).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.payments} payments</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No revenue data available</p>
            </div>
          )}
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
          <div className="space-y-4">
            {analytics.subscriptionBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 flex-shrink-0 ${
                    item.plan === 'Premium' ? 'bg-primary-600' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 truncate">{item.plan}</span>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-medium text-gray-900">{item.count} schools</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      {Object.keys(analytics.paymentStats).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(analytics.paymentStats).map(([status, data]) => (
              <div key={status} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{data.count}</div>
                <div className="text-xs sm:text-sm text-gray-600 capitalize">{status}</div>
                <div className="text-xs text-gray-500">₹{data.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Schools - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Schools by Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topSchools.map((school, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{school.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      school.plan === 'premium' 
                        ? 'bg-purple-100 text-purple-800' 
                        : school.plan === 'standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {school.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{school.users}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      school.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : school.status === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {school.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Schools - Mobile Cards */}
      <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Top Schools by Users</h3>
        <div className="space-y-3">
          {analytics.topSchools.map((school, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{school.name}</div>
                  <div className="text-xs text-gray-500">#{index + 1} by users</div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-sm font-medium text-gray-900">{school.users} users</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  school.plan === 'premium' 
                    ? 'bg-purple-100 text-purple-800' 
                    : school.plan === 'standard'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {school.plan}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  school.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : school.status === 'trial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {school.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics