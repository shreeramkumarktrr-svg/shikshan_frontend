import { useQuery } from '@tanstack/react-query'
import { schoolsAPI } from '../../utils/api'
import api from '../../utils/api'
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import LoadingSpinner from '../LoadingSpinner'
import ResponsiveCard, { CardGrid, StatCard } from '../ResponsiveCard'
import { useAuth } from '../../contexts/AuthContext'

function SuperAdminDashboard() {
  const { user } = useAuth()
  
  // Fetch platform-wide stats
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-stats'],
    queryFn: () => schoolsAPI.getAll({ limit: 1000 })
  })

  // Fetch visitor inquiries stats
  const { data: visitorsData, isLoading: visitorsLoading } = useQuery({
    queryKey: ['visitors-stats'],
    queryFn: () => api.get('/contact/inquiries/stats')
  })

  const schools = schoolsData?.data?.schools || []
  const visitorsStats = visitorsData?.data?.data || {}

  const totalSchools = schools.length
  const activeSchools = schools.filter(s => s.isActive).length
  const totalRevenue = schools.reduce((sum, school) => sum + (school.monthlyRevenue || 0), 0)

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Prepare subscription distribution data using actual subscription names
  const subscriptionCounts = {}
  schools.forEach(school => {
    const subscriptionName = school.subscription?.name || 'Unassigned'
    subscriptionCounts[subscriptionName] = (subscriptionCounts[subscriptionName] || 0) + 1
  })

  const subscriptionData = [
    { name: 'Starter', value: subscriptionCounts['Starter'] || 0, color: '#3B82F6' },
    { name: 'Super', value: subscriptionCounts['Super'] || 0, color: '#10B981' },
    { name: 'Advanced', value: subscriptionCounts['Advanced'] || 0, color: '#F59E0B' },
    ...(subscriptionCounts['Unassigned'] ? [{ name: 'Unassigned', value: subscriptionCounts['Unassigned'], color: '#6B7280' }] : [])
  ].filter(item => item.value > 0)

  // Prepare visitor status distribution data
  const visitorStatusData = visitorsStats.statusCounts ? [
    { name: 'Pending', value: visitorsStats.statusCounts['Pending'] || 0, color: '#F59E0B' },
    { name: 'Demo Planned', value: visitorsStats.statusCounts['Demo Planned'] || 0, color: '#3B82F6' },
    { name: 'Demo Done', value: visitorsStats.statusCounts['Demo Done'] || 0, color: '#8B5CF6' },
    { name: 'Onboarded', value: visitorsStats.statusCounts['Onboarded'] || 0, color: '#10B981' },
    { name: 'Denied', value: visitorsStats.statusCounts['Denied'] || 0, color: '#EF4444' }
  ].filter(item => item.value > 0) : []

  return (
    <div className="space-y-6">
      {/* Warm Greeting */}
      <div className="text-center sm:text-left">
        <h1 className="text-responsive-xl font-bold text-gray-900">
          {getGreeting()}, {user?.firstName || 'Admin'}! 👋
        </h1>
        <p className="text-responsive-sm text-gray-600 mt-2">
          Welcome back to your Shikshan platform. Here's what's happening today.
        </p>
      </div>

      {/* Key Platform Stats */}
      <CardGrid columns={3}>
        <StatCard
          title="Total Schools"
          value={totalSchools}
          change={`${activeSchools} active`}
          changeType="positive"
          icon={<BuildingOfficeIcon className="h-6 w-6 text-blue-600" />}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
        />
        
        <StatCard
          title="New Inquiries"
          value={visitorsStats.recentCount || 0}
          change="Last 30 days"
          changeType="neutral"
          icon={<ChartBarIcon className="h-6 w-6 text-purple-600" />}
        />
      </CardGrid>

      {/* Analytics Charts */}
      <CardGrid columns={2}>
        {/* Subscription Distribution */}
        <ResponsiveCard 
          title="Subscription Plans Distribution"
          className="lg:col-span-1"
        >
          {schoolsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : subscriptionData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mb-2 text-gray-300" />
              <p>No subscription data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} schools`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ResponsiveCard>

        {/* Visitor Status Distribution */}
        <ResponsiveCard 
          title="Visitor Inquiries Status"
          className="lg:col-span-1"
        >
          {visitorsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : visitorStatusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mb-2 text-gray-300" />
              <p>No visitor data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitorStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {visitorStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} inquiries`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ResponsiveCard>
      </CardGrid>

      {/* Quick Stats Summary */}
      <ResponsiveCard title="Platform Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalSchools}</div>
            <div className="text-sm text-gray-600">Total Schools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeSchools}</div>
            <div className="text-sm text-gray-600">Active Schools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{visitorsStats.totalInquiries || 0}</div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{visitorsStats.statusCounts?.['Onboarded'] || 0}</div>
            <div className="text-sm text-gray-600">Converted</div>
          </div>
        </div>
      </ResponsiveCard>
    </div>
  )
}

export default SuperAdminDashboard