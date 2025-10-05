import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { eventsAPI } from '../../utils/api'
import { 
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../LoadingSpinner'

function DefaultDashboard() {
  const { user } = useAuth()

  // Fetch recent events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-events'],
    queryFn: () => eventsAPI.getAll({ limit: 5, published: 'true' })
  })

  const recentEvents = eventsData?.data?.events || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's your overview for today.
        </p>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Your Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.school?.name || 'Not assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
          </div>
          <div className="card-body">
            {eventsLoading ? (
              <LoadingSpinner />
            ) : recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent events</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        event.priority === 'urgent' ? 'bg-red-400' :
                        event.priority === 'high' ? 'bg-orange-400' :
                        event.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">{event.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {event.startDate && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                        )}
                        <span className="capitalize">{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-outline">
                View Profile
              </button>
              <button className="btn-outline">
                View Events
              </button>
              <button className="btn-outline">
                Contact Support
              </button>
              <button className="btn-outline">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific message */}
      <div className="card border-l-4 border-blue-400 bg-blue-50">
        <div className="card-body">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Role Information</h4>
              <p className="text-sm text-blue-700">
                You are logged in as a {user?.role?.replace('_', ' ')}. 
                Your specific dashboard features may be limited based on your permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefaultDashboard