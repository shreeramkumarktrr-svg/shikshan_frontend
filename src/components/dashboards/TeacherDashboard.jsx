import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { classesAPI, homeworkAPI, attendanceAPI, eventsAPI } from '../../utils/api'
import { 
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../LoadingSpinner'

function TeacherDashboard() {
  const { user } = useAuth()

  // Fetch teacher's classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => classesAPI.getAll({ teacherId: user?.id })
  })

  // Fetch homework assigned by teacher
  const { data: homeworkData, isLoading: homeworkLoading } = useQuery({
    queryKey: ['teacher-homework'],
    queryFn: () => homeworkAPI.getAll({ assignedBy: user?.id, limit: 5 })
  })

  // Fetch recent events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['teacher-events'],
    queryFn: () => eventsAPI.getAll({ limit: 5, published: 'true' })
  })

  // Get today's attendance stats for teacher's classes
  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['teacher-attendance-stats'],
    queryFn: () => attendanceAPI.getReport({ 
      teacherId: user?.id,
      date: new Date().toISOString().split('T')[0]
    })
  })

  const classes = classesData?.data?.classes || []
  const homework = homeworkData?.data?.homework || []
  const recentEvents = eventsData?.data?.events || []
  const todayStats = attendanceStats?.data?.todayStats || { present: 0, total: 0, classes: 0 }

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
  const pendingHomework = homework.filter(hw => hw.status === 'active').length
  const attendanceRate = todayStats.total > 0 
    ? Math.round((todayStats.present / todayStats.total) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's your teaching overview for today</p>
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Students</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Homework</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingHomework}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceRate}%</p>
                <p className="text-xs text-gray-500">{todayStats.present}/{todayStats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Classes & Recent Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
          </div>
          <div className="card-body">
            {classesLoading ? (
              <LoadingSpinner />
            ) : classes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No classes assigned</p>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cls.name}</p>
                      <p className="text-xs text-gray-500">
                        {cls.subject} • {cls.studentCount || 0} students
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Next: {cls.nextClass || 'No schedule'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Homework</h3>
          </div>
          <div className="card-body">
            {homeworkLoading ? (
              <LoadingSpinner />
            ) : homework.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No homework assigned</p>
            ) : (
              <div className="space-y-4">
                {homework.map((hw) => (
                  <div key={hw.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        hw.status === 'active' ? 'bg-green-400' :
                        hw.status === 'completed' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">{hw.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{hw.className}</span>
                        {hw.dueDate && (
                          <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">School Events</h3>
          </div>
          <div className="card-body">
            {eventsLoading ? (
              <LoadingSpinner />
            ) : recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.startDate && new Date(event.startDate).toLocaleDateString()}
                      </p>
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
              <button 
                onClick={() => window.location.href = '/app/attendance'}
                className="btn-primary flex items-center justify-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Mark Attendance
              </button>
              <button 
                onClick={() => window.location.href = '/app/homework'}
                className="btn-outline flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Assign Homework
              </button>
              <button 
                onClick={() => window.location.href = '/app/students'}
                className="btn-outline flex items-center justify-center"
              >
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                View Students
              </button>
              <button 
                onClick={() => window.location.href = '/app/classes'}
                className="btn-outline flex items-center justify-center"
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                My Classes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard