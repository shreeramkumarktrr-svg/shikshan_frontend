import { useQuery } from '@tanstack/react-query'
import { usersAPI, classesAPI, attendanceAPI, eventsAPI } from '../../utils/api'
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../LoadingSpinner'

function SchoolAdminDashboard() {
  // Fetch school-wide stats
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers-count'],
    queryFn: () => usersAPI.getByRole('teacher', { limit: 1000 })
  })

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-count'],
    queryFn: () => usersAPI.getByRole('student', { limit: 1000 })
  })

  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['classes-count'],
    queryFn: () => classesAPI.getAll({ limit: 1000 })
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-events'],
    queryFn: () => eventsAPI.getAll({ limit: 5, published: 'true' })
  })

  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: () => attendanceAPI.getReport({ 
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
  })

  const teachers = teachersData?.data?.users || []
  const students = studentsData?.data?.users || []
  const classes = classesData?.data?.classes || []
  const recentEvents = eventsData?.data?.events || []

  const todayAttendance = attendanceStats?.data?.todayStats || { present: 0, total: 0 }
  const attendanceRate = todayAttendance.total > 0 
    ? Math.round((todayAttendance.present / todayAttendance.total) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
        <p className="text-gray-600">Overview of your school's performance and activities</p>
      </div>

      {/* School Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">{teachers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceRate}%</p>
                <p className="text-xs text-gray-500">{todayAttendance.present}/{todayAttendance.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
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
            <h3 className="text-lg font-medium text-gray-900">Admin Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.href = '/app/teachers'}
                className="btn-primary flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Teacher
              </button>
              <button 
                onClick={() => window.location.href = '/app/classes'}
                className="btn-outline flex items-center justify-center"
              >
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                Manage Classes
              </button>
              <button 
                onClick={() => window.location.href = '/app/fees'}
                className="btn-outline flex items-center justify-center"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                Fee Management
              </button>
              <button 
                onClick={() => window.location.href = '/app/reports'}
                className="btn-outline flex items-center justify-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Low Attendance Alert */}
      {attendanceRate < 80 && (
        <div className="card border-l-4 border-red-400 bg-red-50">
          <div className="card-body">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Low Attendance Alert</h4>
                <p className="text-sm text-red-700">
                  Today's attendance is {attendanceRate}%. Consider following up with absent students.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolAdminDashboard