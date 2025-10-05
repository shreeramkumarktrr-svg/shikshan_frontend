import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ClockIcon, 
  UserIcon, 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { usersAPI } from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

function UserActivityLog({ userId, userName }) {
  const [filters, setFilters] = useState({
    action: '',
    dateFrom: '',
    dateTo: '',
    limit: 20
  })

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['user-activity', userId, filters],
    queryFn: () => usersAPI.getActivity(userId, filters),
    enabled: !!userId
  })

  const getActionIcon = (action) => {
    const icons = {
      login: UserIcon,
      logout: UserIcon,
      profile_update: UserIcon,
      password_change: UserIcon,
      event_create: CalendarIcon,
      event_update: CalendarIcon,
      attendance_mark: ClockIcon,
      default: ClockIcon
    }
    const IconComponent = icons[action] || icons.default
    return <IconComponent className="h-5 w-5" />
  }

  const getActionColor = (action) => {
    const colors = {
      login: 'text-green-600 bg-green-100',
      logout: 'text-gray-600 bg-gray-100',
      profile_update: 'text-blue-600 bg-blue-100',
      password_change: 'text-yellow-600 bg-yellow-100',
      event_create: 'text-purple-600 bg-purple-100',
      event_update: 'text-indigo-600 bg-indigo-100',
      attendance_mark: 'text-orange-600 bg-orange-100',
      default: 'text-gray-600 bg-gray-100'
    }
    return colors[action] || colors.default
  }

  const getDeviceIcon = (device) => {
    if (device?.includes('Mobile') || device?.includes('Android') || device?.includes('iPhone')) {
      return <DevicePhoneMobileIcon className="h-4 w-4" />
    }
    return <ComputerDesktopIcon className="h-4 w-4" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  }

  if (isLoading) return <LoadingSpinner />

  const activities = activityData?.data?.activities || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
          <p className="text-sm text-gray-500">
            Recent activities for {userName}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="input w-40"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="profile_update">Profile Update</option>
              <option value="password_change">Password Change</option>
              <option value="event_create">Event Create</option>
              <option value="attendance_mark">Attendance</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="input w-40"
              placeholder="From Date"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="input w-40"
              placeholder="To Date"
            />

            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="input w-24"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="card">
        <div className="card-body p-0">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500">
                No activities match your current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((activity, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    {/* Action Icon */}
                    <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description || activity.action.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>

                      {/* Additional Details */}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        {activity.ipAddress && (
                          <div className="flex items-center space-x-1">
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>{activity.ipAddress}</span>
                          </div>
                        )}

                        {activity.userAgent && (
                          <div className="flex items-center space-x-1">
                            {getDeviceIcon(activity.userAgent)}
                            <span className="truncate max-w-xs">
                              {activity.userAgent.split(' ')[0]}
                            </span>
                          </div>
                        )}

                        {activity.location && (
                          <span>{activity.location}</span>
                        )}
                      </div>

                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Load More */}
      {activities.length >= filters.limit && (
        <div className="text-center">
          <button
            onClick={() => setFilters({ ...filters, limit: filters.limit + 20 })}
            className="btn-outline"
          >
            Load More Activities
          </button>
        </div>
      )}
    </div>
  )
}

export default UserActivityLog