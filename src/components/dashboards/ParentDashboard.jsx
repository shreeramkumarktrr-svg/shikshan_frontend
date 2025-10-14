import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI, homeworkAPI, attendanceAPI, eventsAPI } from '../../utils/api'
import { 
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../LoadingSpinner'

function ParentDashboard() {
  const { user } = useAuth()

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => usersAPI.getAll({ parentId: user?.id, role: 'student' })
  })

  // Fetch children's homework (for first child for now)
  const children = childrenData?.data?.users || []
  const firstChild = children[0]

  const { data: homeworkData, isLoading: homeworkLoading } = useQuery({
    queryKey: ['child-homework', firstChild?.id],
    queryFn: () => firstChild ? homeworkAPI.getAll({ studentId: firstChild.id, limit: 10 }) : null,
    enabled: !!firstChild
  })

  // Fetch children's attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['child-attendance', firstChild?.id],
    queryFn: () => firstChild ? attendanceAPI.getByStudent(firstChild.id, { 
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }) : null,
    enabled: !!firstChild
  })

  // Fetch school events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['parent-events'],
    queryFn: () => eventsAPI.getAll({ limit: 5, published: 'true' })
  })

  const homework = homeworkData?.data?.homework || []
  const attendance = attendanceData?.data?.attendance || []
  const events = eventsData?.data?.events || []

  // Calculate stats for first child
  const pendingHomework = homework.filter(hw => hw.status === 'pending' || hw.status === 'active').length
  const completedHomework = homework.filter(hw => hw.status === 'submitted' || hw.status === 'graded').length
  const overdueHomework = homework.filter(hw => 
    hw.status === 'pending' && new Date(hw.dueDate) < new Date()
  ).length

  const totalDays = attendance.length
  const presentDays = attendance.filter(att => att.status === 'present').length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          {children.length > 0 
            ? `Monitor your ${children.length > 1 ? 'children\'s' : 'child\'s'} academic progress`
            : 'No children found in your account'
          }
        </p>
      </div>

      {/* Children Overview */}
      {children.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">My Children</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div key={child.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {child.firstName?.[0]}{child.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Class: {child.className || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {firstChild && (
        <>
          {/* Child Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Homework</p>
                    <p className="text-2xl font-semibold text-gray-900">{pendingHomework}</p>
                    {overdueHomework > 0 && (
                      <p className="text-xs text-red-600">{overdueHomework} overdue</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{completedHomework}</p>
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
                    <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{attendanceRate}%</p>
                    <p className="text-xs text-gray-500">{presentDays}/{totalDays} days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">My Children</p>
                    <p className="text-2xl font-semibold text-gray-900">{children.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Homework & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  {firstChild.firstName}'s Homework
                </h3>
              </div>
              <div className="card-body">
                {homeworkLoading ? (
                  <LoadingSpinner />
                ) : homework.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No homework assigned</p>
                ) : (
                  <div className="space-y-4">
                    {homework.slice(0, 5).map((hw) => {
                      const isOverdue = new Date(hw.dueDate) < new Date() && hw.status === 'pending'
                      return (
                        <div key={hw.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`h-2 w-2 rounded-full mt-2 ${
                              hw.status === 'submitted' ? 'bg-green-400' :
                              hw.status === 'graded' ? 'bg-blue-400' :
                              isOverdue ? 'bg-red-400' : 'bg-yellow-400'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium truncate">{hw.title}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{hw.subject}</span>
                              {hw.dueDate && (
                                <span className={isOverdue ? 'text-red-600' : ''}>
                                  Due: {new Date(hw.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {hw.status === 'graded' && hw.grade && (
                              <p className="text-xs text-green-600">Grade: {hw.grade}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">School Events</h3>
              </div>
              <div className="card-body">
                {eventsLoading ? (
                  <LoadingSpinner />
                ) : events.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mt-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">{event.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {event.startDate && (
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
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
          </div>

          {/* Alerts & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => window.location.href = '/app/homework'}
                    className="btn-primary flex items-center justify-center"
                  >
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    View Progress
                  </button>
                  <button 
                    onClick={() => window.location.href = '/app/fees'}
                    className="btn-outline flex items-center justify-center"
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Pay Fees
                  </button>
                  <button 
                    onClick={() => window.location.href = '/app/complaints'}
                    className="btn-outline flex items-center justify-center"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Contact School
                  </button>
                  <button 
                    onClick={() => window.location.href = '/app/events'}
                    className="btn-outline flex items-center justify-center"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    School Events
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-4">
              {overdueHomework > 0 && (
                <div className="card border-l-4 border-red-400 bg-red-50">
                  <div className="card-body">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Overdue Homework Alert</h4>
                        <p className="text-sm text-red-700">
                          {firstChild.firstName} has {overdueHomework} overdue assignment{overdueHomework > 1 ? 's' : ''}. 
                          Please help them complete it.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {attendanceRate < 75 && (
                <div className="card border-l-4 border-yellow-400 bg-yellow-50">
                  <div className="card-body">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Low Attendance Alert</h4>
                        <p className="text-sm text-yellow-700">
                          {firstChild.firstName}'s attendance is {attendanceRate}%. 
                          Please ensure regular school attendance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ParentDashboard