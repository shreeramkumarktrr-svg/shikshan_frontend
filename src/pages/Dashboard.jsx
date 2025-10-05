import { useAuth } from '../contexts/AuthContext'
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard'
import SchoolAdminDashboard from '../components/dashboards/SchoolAdminDashboard'
import PrincipalDashboard from '../components/dashboards/PrincipalDashboard'
import TeacherDashboard from '../components/dashboards/TeacherDashboard'
import StudentDashboard from '../components/dashboards/StudentDashboard'
import ParentDashboard from '../components/dashboards/ParentDashboard'
import DefaultDashboard from '../components/dashboards/DefaultDashboard'
import LoadingSpinner from '../components/LoadingSpinner'

function Dashboard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard</p>
      </div>
    )
  }

  // Render role-specific dashboard
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    
    case 'school_admin':
      return <SchoolAdminDashboard />
    
    case 'principal':
      return <PrincipalDashboard />
    
    case 'teacher':
      return <TeacherDashboard />
    
    case 'student':
      return <StudentDashboard />
    
    case 'parent':
      return <ParentDashboard />
    
    case 'finance_officer':
      // Finance officers can use school admin dashboard for now
      return <SchoolAdminDashboard />
    
    case 'support_staff':
      // Support staff can use a simplified teacher dashboard
      return <TeacherDashboard />
    
    default:
      return <DefaultDashboard />
  }
}

export default Dashboard