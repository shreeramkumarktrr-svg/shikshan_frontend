import { useQuery } from '@tanstack/react-query'
import { schoolsAPI, usersAPI } from '../../utils/api'
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../LoadingSpinner'
import ResponsiveCard, { CardGrid, StatCard } from '../ResponsiveCard'
import { FormButton } from '../ResponsiveForm'

function SuperAdminDashboard() {
  // Fetch platform-wide stats
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-stats'],
    queryFn: () => schoolsAPI.getAll({ limit: 1000 })
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-stats'],
    queryFn: () => usersAPI.getStats()
  })

  const schools = schoolsData?.data?.schools || []
  const userStats = usersData?.data || {}

  const totalSchools = schools.length
  const activeSchools = schools.filter(s => s.isActive).length
  const totalRevenue = schools.reduce((sum, school) => sum + (school.monthlyRevenue || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-responsive-xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-responsive-sm text-gray-600 mt-2">Monitor and manage all schools on the platform</p>
      </div>

      {/* Platform Stats */}
      <CardGrid columns={4}>
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
          title="Total Users"
          value={userStats.totalUsers || 0}
          icon={<UserGroupIcon className="h-6 w-6 text-purple-600" />}
        />
        
        <StatCard
          title="Growth Rate"
          value="+12%"
          change="This month"
          changeType="positive"
          icon={<ChartBarIcon className="h-6 w-6 text-yellow-600" />}
        />
      </CardGrid>

      {/* Recent Schools & Quick Actions */}
      <CardGrid columns={2}>
        <ResponsiveCard 
          title="Recent Schools"
          className="lg:col-span-1"
        >
          {schoolsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : schools.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No schools registered</p>
          ) : (
            <div className="space-y-4">
              {schools.slice(0, 5).map((school) => (
                <div key={school.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                    <p className="text-xs text-gray-500">{school.city}, {school.state}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4 flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start">
                    <p className="text-sm text-gray-900">{school.studentCount || 0} students</p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                      school.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveCard>

        <ResponsiveCard 
          title="Platform Actions"
          className="lg:col-span-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormButton variant="primary" fullWidth>
              Add School
            </FormButton>
            <FormButton variant="secondary" fullWidth>
              View Analytics
            </FormButton>
            <FormButton variant="secondary" fullWidth>
              Manage Subscriptions
            </FormButton>
            <FormButton variant="secondary" fullWidth>
              Generate Report
            </FormButton>
          </div>
        </ResponsiveCard>
      </CardGrid>
    </div>
  )
}

export default SuperAdminDashboard