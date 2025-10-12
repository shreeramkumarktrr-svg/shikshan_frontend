import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PageHeader from '../components/PageHeader'
import FeatureGuard from '../components/FeatureGuard'
import { FEATURES, hasTeacherReportAccess, canAccessFinancialReports } from '../utils/featureAccess'
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

function Reports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportData, setReportData] = useState({
    school: null,
    users: null,
    attendance: null,
    homework: null,
    events: null,
    fees: null,
    complaints: null
  })
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const allReportTabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: ChartBarIcon,
      description: 'School-wide statistics and key metrics'
    },
    {
      id: 'academic',
      name: 'Academic',
      icon: AcademicCapIcon,
      description: 'Homework, attendance, and academic performance'
    },
    {
      id: 'financial',
      name: 'Financial',
      icon: CurrencyDollarIcon,
      description: 'Fee collection and payment reports',
      requiresFinancialAccess: true // Exclude teachers and other unauthorized roles
    },
    {
      id: 'operational',
      name: 'Operational',
      icon: DocumentChartBarIcon,
      description: 'Events, complaints, and operational metrics'
    }
  ]

  // Filter tabs based on user role
  const reportTabs = allReportTabs.filter(tab => {
    if (tab.requiresFinancialAccess) {
      return canAccessFinancialReports(user?.role);
    }
    return true; // No restriction
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  // Redirect unauthorized users away from financial tab
  useEffect(() => {
    if (activeTab === 'financial' && !canAccessFinancialReports(user?.role)) {
      setActiveTab('overview')
    }
  }, [activeTab, user?.role])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      const promises = []
      
      // School statistics
      if (user.schoolId) {
        promises.push(
          api.get(`/schools/${user.schoolId}/stats`).catch(err => ({ data: null, error: err }))
        )
      } else {
        promises.push(Promise.resolve({ data: null }))
      }
      
      // User statistics
      promises.push(
        api.get('/users/stats').catch(err => ({ data: null, error: err }))
      )
      
      // Attendance statistics
      promises.push(
        api.get(`/attendance/staff/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
          .catch(err => ({ data: null, error: err }))
      )
      
      // Homework statistics
      promises.push(
        api.get('/homework/stats/overview').catch(err => ({ data: null, error: err }))
      )
      
      // Events statistics
      promises.push(
        api.get('/events/stats').catch(err => ({ data: null, error: err }))
      )
      
      // Fees statistics - Only fetch for authorized roles
      if (canAccessFinancialReports(user?.role)) {
        promises.push(
          api.get('/fees/stats/overview').catch(err => ({ data: null, error: err }))
        )
      } else {
        promises.push(Promise.resolve({ data: null }))
      }
      
      // Complaints statistics
      promises.push(
        api.get('/complaints/stats').catch(err => ({ data: null, error: err }))
      )

      const [
        schoolResponse,
        usersResponse,
        attendanceResponse,
        homeworkResponse,
        eventsResponse,
        feesResponse,
        complaintsResponse
      ] = await Promise.all(promises)

      setReportData({
        school: schoolResponse.data?.stats || null,
        users: usersResponse.data || null,
        attendance: attendanceResponse.data?.statistics || null,
        homework: homeworkResponse.data || null,
        events: eventsResponse.data || null,
        fees: feesResponse.data || null,
        complaints: complaintsResponse.data || null
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportData.school?.users?.student || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportData.school?.users?.teacher || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Classes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportData.school?.classes?.total || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportData.attendance?.attendancePercentage || '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={`grid grid-cols-1 ${canAccessFinancialReports(user?.role) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Academic Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Homework</span>
                <span className="font-semibold">{reportData.homework?.activeHomework || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Submission Rate</span>
                <span className="font-semibold">{reportData.homework?.submissionRate || '0%'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upcoming Events</span>
                <span className="font-semibold">{reportData.events?.upcomingEvents || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview - Only show to authorized roles */}
        {canAccessFinancialReports(user?.role) && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Financial Overview</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Fees</span>
                  <span className="font-semibold">₹{reportData.fees?.totalFees || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collected</span>
                  <span className="font-semibold text-green-600">₹{reportData.fees?.totalCollected || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <span className="font-semibold">{reportData.fees?.collectionRate || '0'}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderAcademicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Homework Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Assignments</span>
                <span className="font-semibold">{reportData.homework?.totalHomework || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="font-semibold">{reportData.homework?.activeHomework || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold">{reportData.homework?.completedHomework || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Submission Rate</span>
                <span className="font-semibold">{reportData.homework?.submissionRate || '0%'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Attendance Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Days</span>
                <span className="font-semibold">{reportData.attendance?.totalDays || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Present Days</span>
                <span className="font-semibold">{reportData.attendance?.presentDays || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-semibold">{reportData.attendance?.attendancePercentage || '0'}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Fee Collection Report</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">₹{reportData.fees?.totalFees || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Fees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{reportData.fees?.totalCollected || '0.00'}</p>
              <p className="text-sm text-gray-600">Collected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">₹{reportData.fees?.totalPending || '0.00'}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Collection Progress</span>
              <span className="text-sm font-medium">{reportData.fees?.collectionRate || '0'}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${reportData.fees?.collectionRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOperationalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Events Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="font-semibold">{reportData.events?.totalEvents || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upcoming</span>
                <span className="font-semibold">{reportData.events?.upcomingEvents || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold">{reportData.events?.completedEvents || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Complaints Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Complaints</span>
                <span className="font-semibold">{reportData.complaints?.totalComplaints || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold">{reportData.complaints?.pendingComplaints || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="font-semibold">{reportData.complaints?.resolvedComplaints || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <FeatureGuard feature={FEATURES.REPORTS}>
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Comprehensive reports and analytics for data-driven decision making"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-field text-sm"
              />
            </div>
            <button className="btn-outline">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </PageHeader>

        {/* Report Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {reportTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Report Content */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'academic' && renderAcademicTab()}
          {activeTab === 'financial' && canAccessFinancialReports(user?.role) && renderFinancialTab()}
          {activeTab === 'operational' && renderOperationalTab()}
        </div>
      </div>
    </FeatureGuard>
  )
}

export default Reports