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
import toast from 'react-hot-toast'

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
  const [isExporting, setIsExporting] = useState(false)

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

  // CSV Export Utility Functions
  const convertToCSV = (data, headers) => {
    if (!data || data.length === 0) return ''
    
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

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
        attendanceResponse,
        homeworkResponse,
        eventsResponse,
        feesResponse,
        complaintsResponse
      ] = await Promise.all(promises)

      setReportData({
        school: schoolResponse.data?.stats || null,
        users: schoolResponse.data?.stats?.users || null,
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

  const handleExportReports = async () => {
    try {
      setIsExporting(true)
      toast.loading('Preparing export...', { id: 'export-toast' })

      // Fetch detailed data for export
      const exportPromises = []
      
      // School Overview Data
      const overviewData = [{
        'Report Type': 'School Overview',
        'Total Students': reportData.school?.users?.student || 0,
        'Total Teachers': reportData.school?.users?.teacher || 0,
        'Total Classes': reportData.school?.classes?.total || 0,
        'Attendance Rate': `${reportData.attendance?.attendancePercentage || 0}%`,
        'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`,
        'Generated On': formatDate(new Date().toISOString())
      }]

      // Academic Data
      const academicData = [{
        'Report Type': 'Academic Summary',
        'Total Homework': reportData.homework?.totalHomework || 0,
        'Active Homework': reportData.homework?.activeHomework || 0,
        'Completed Homework': reportData.homework?.completedHomework || 0,
        'Submission Rate': reportData.homework?.submissionRate || '0%',
        'Total Attendance Days': reportData.attendance?.totalDays || 0,
        'Present Days': reportData.attendance?.presentDays || 0,
        'Attendance Percentage': `${reportData.attendance?.attendancePercentage || 0}%`,
        'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
      }]

      // Events Data
      const eventsData = [{
        'Report Type': 'Events Summary',
        'Total Events': reportData.events?.totalEvents || 0,
        'Upcoming Events': reportData.events?.upcomingEvents || 0,
        'Completed Events': reportData.events?.completedEvents || 0,
        'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
      }]

      // Complaints Data
      const complaintsData = [{
        'Report Type': 'Complaints Summary',
        'Total Complaints': reportData.complaints?.totalComplaints || 0,
        'Pending Complaints': reportData.complaints?.pendingComplaints || 0,
        'Resolved Complaints': reportData.complaints?.resolvedComplaints || 0,
        'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
      }]

      // Financial Data (if accessible)
      let financialData = []
      if (canAccessFinancialReports(user?.role) && reportData.fees) {
        financialData = [{
          'Report Type': 'Financial Summary',
          'Total Fees': `₹${reportData.fees?.totalFees || '0.00'}`,
          'Total Collected': `₹${reportData.fees?.totalCollected || '0.00'}`,
          'Total Pending': `₹${reportData.fees?.totalPending || '0.00'}`,
          'Collection Rate': `${reportData.fees?.collectionRate || 0}%`,
          'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
        }]
      }

      // Combine all data
      const allReportsData = [
        ...overviewData,
        ...academicData,
        ...eventsData,
        ...complaintsData,
        ...financialData
      ]

      // Generate CSV content
      const headers = [
        'Report Type',
        'Total Students',
        'Total Teachers', 
        'Total Classes',
        'Attendance Rate',
        'Total Homework',
        'Active Homework',
        'Completed Homework',
        'Submission Rate',
        'Total Attendance Days',
        'Present Days',
        'Attendance Percentage',
        'Total Events',
        'Upcoming Events',
        'Completed Events',
        'Total Complaints',
        'Pending Complaints',
        'Resolved Complaints',
        'Total Fees',
        'Total Collected',
        'Total Pending',
        'Collection Rate',
        'Date Range',
        'Generated On'
      ]

      const csvContent = convertToCSV(allReportsData, headers)
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `school-reports-${timestamp}.csv`
      
      // Download the file
      downloadCSV(csvContent, filename)
      
      toast.success('Report exported successfully!', { id: 'export-toast' })
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report. Please try again.', { id: 'export-toast' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCurrentTab = async () => {
    try {
      setIsExporting(true)
      toast.loading(`Exporting ${activeTab} data...`, { id: 'export-toast' })

      let tabData = []
      let filename = ''

      switch (activeTab) {
        case 'overview':
          tabData = [{
            'Metric': 'Total Students',
            'Value': reportData.school?.users?.student || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Total Teachers',
            'Value': reportData.school?.users?.teacher || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Total Classes',
            'Value': reportData.school?.classes?.total || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Attendance Rate',
            'Value': `${reportData.attendance?.attendancePercentage || 0}%`,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }]
          filename = `overview-report-${new Date().toISOString().split('T')[0]}.csv`
          break

        case 'academic':
          tabData = [{
            'Metric': 'Total Homework',
            'Value': reportData.homework?.totalHomework || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Active Homework',
            'Value': reportData.homework?.activeHomework || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Completed Homework',
            'Value': reportData.homework?.completedHomework || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Submission Rate',
            'Value': reportData.homework?.submissionRate || '0%',
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Total Attendance Days',
            'Value': reportData.attendance?.totalDays || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Present Days',
            'Value': reportData.attendance?.presentDays || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }]
          filename = `academic-report-${new Date().toISOString().split('T')[0]}.csv`
          break

        case 'financial':
          if (canAccessFinancialReports(user?.role)) {
            tabData = [{
              'Metric': 'Total Fees',
              'Value': `₹${reportData.fees?.totalFees || '0.00'}`,
              'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
            }, {
              'Metric': 'Total Collected',
              'Value': `₹${reportData.fees?.totalCollected || '0.00'}`,
              'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
            }, {
              'Metric': 'Total Pending',
              'Value': `₹${reportData.fees?.totalPending || '0.00'}`,
              'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
            }, {
              'Metric': 'Collection Rate',
              'Value': `${reportData.fees?.collectionRate || 0}%`,
              'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
            }]
            filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
          }
          break

        case 'operational':
          tabData = [{
            'Metric': 'Total Events',
            'Value': reportData.events?.totalEvents || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Upcoming Events',
            'Value': reportData.events?.upcomingEvents || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Completed Events',
            'Value': reportData.events?.completedEvents || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Total Complaints',
            'Value': reportData.complaints?.totalComplaints || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Pending Complaints',
            'Value': reportData.complaints?.pendingComplaints || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }, {
            'Metric': 'Resolved Complaints',
            'Value': reportData.complaints?.resolvedComplaints || 0,
            'Date Range': `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
          }]
          filename = `operational-report-${new Date().toISOString().split('T')[0]}.csv`
          break

        default:
          throw new Error('Invalid tab for export')
      }

      if (tabData.length > 0) {
        const headers = ['Metric', 'Value', 'Date Range']
        const csvContent = convertToCSV(tabData, headers)
        downloadCSV(csvContent, filename)
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report exported successfully!`, { id: 'export-toast' })
      } else {
        toast.error('No data available to export', { id: 'export-toast' })
      }

    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report. Please try again.', { id: 'export-toast' })
    } finally {
      setIsExporting(false)
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Students</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {reportData.school?.users?.student || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Teachers</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {reportData.school?.users?.teacher || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Classes</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {reportData.school?.classes?.total || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Attendance</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {reportData.attendance?.attendancePercentage || '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={`grid grid-cols-1 ${canAccessFinancialReports(user?.role) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4 sm:gap-6`}>
        <div className="card">
          <div className="card-header">
            <h3 className="text-base sm:text-lg font-medium">Academic Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
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
              <h3 className="text-base sm:text-lg font-medium">Financial Overview</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3 sm:space-y-4">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-base sm:text-lg font-medium">Homework Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
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
            <h3 className="text-base sm:text-lg font-medium">Attendance Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-base sm:text-lg font-medium">Fee Collection Report</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{reportData.fees?.totalFees || '0.00'}</p>
              <p className="text-sm text-gray-600">Total Fees</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-green-600">₹{reportData.fees?.totalCollected || '0.00'}</p>
              <p className="text-sm text-gray-600">Collected</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-orange-600">₹{reportData.fees?.totalPending || '0.00'}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Collection Progress</span>
              <span className="text-sm font-medium">{reportData.fees?.collectionRate || '0'}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${reportData.fees?.collectionRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOperationalTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-base sm:text-lg font-medium">Events Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
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
            <h3 className="text-base sm:text-lg font-medium">Complaints Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 sm:space-y-4">
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
    return <LoadingSpinner centered />
  }

  return (
    <FeatureGuard feature={FEATURES.REPORTS}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Comprehensive reports and analytics for data-driven decision making
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input text-sm w-auto"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input text-sm w-auto"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleExportReports}
                disabled={isExporting || loading}
                className="btn-primary w-full sm:w-auto whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export All'}
              </button>
              <button 
                onClick={handleExportCurrentTab}
                disabled={isExporting || loading}
                className="btn-outline w-full sm:w-auto whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="border-b border-gray-200">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="input w-full mb-4"
            >
              {reportTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden sm:flex -mb-px space-x-4 lg:space-x-8 overflow-x-auto">
            {reportTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`-ml-0.5 mr-2 h-4 w-4 sm:h-5 sm:w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span className="hidden sm:inline">{tab.name}</span>
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