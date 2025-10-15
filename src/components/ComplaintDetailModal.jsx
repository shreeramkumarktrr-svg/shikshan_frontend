import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { complaintsAPI } from '../utils/api'
import { 
  XMarkIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

function ComplaintDetailModal({ complaint: initialComplaint, onClose, onUpdate }) {
  const { user, hasRole } = useAuth()
  const [complaint, setComplaint] = useState(initialComplaint)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [resolution, setResolution] = useState('')
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  const canUpdateStatus = hasRole(['teacher', 'principal', 'school_admin', 'super_admin'])
  const canAddComments = true // All users can add comments

  useEffect(() => {
    fetchComplaintDetails()
  }, [])

  const fetchComplaintDetails = async () => {
    setIsLoading(true)
    try {
      const response = await complaintsAPI.getById(complaint.id)
      setComplaint(response.data.data.complaint)
    } catch (error) {
      console.error('Fetch complaint details error:', error)
      toast.error('Failed to load complaint details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setIsUpdating(true)
    try {
      await complaintsAPI.updateStatus(complaint.id, {
        status: newStatus,
        resolution: newStatus === 'resolved' ? resolution : undefined
      })
      
      toast.success('Status updated successfully')
      setShowStatusUpdate(false)
      setNewStatus('')
      setResolution('')
      await fetchComplaintDetails()
      onUpdate()
    } catch (error) {
      console.error('Update status error:', error)
      toast.error(error.response?.data?.error || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) {
      toast.error('Please add a message')
      return
    }

    setIsUpdating(true)
    try {
      await complaintsAPI.addUpdate(complaint.id, {
        message: newUpdate.trim()
      })
      
      toast.success('Update added successfully')
      setNewUpdate('')
      await fetchComplaintDetails()
      onUpdate()
    } catch (error) {
      console.error('Add update error:', error)
      toast.error(error.response?.data?.error || 'Failed to add update')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'closed':
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'status_change':
        return <ClockIcon className="h-4 w-4 text-blue-500" />
      case 'assignment':
        return <UserIcon className="h-4 w-4 text-purple-500" />
      case 'resolution':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading || !complaint) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            {getStatusIcon(complaint.status)}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Complaint Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 self-end sm:self-auto"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Complaint Header */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">{complaint.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 break-words">{complaint.description}</p>
              </div>
              <div className="ml-0 sm:ml-4 flex-shrink-0">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium capitalize">{complaint.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Raised By</p>
                <p className="font-medium">
                  {complaint.complainant?.firstName} {complaint.complainant?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {complaint.complainant?.role?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Date Created</p>
                <p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {complaint.assignee && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-sm">Assigned To</p>
                <p className="font-medium">
                  {complaint.assignee.firstName} {complaint.assignee.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {complaint.assignee.role?.replace('_', ' ')}
                </p>
              </div>
            )}

            {complaint.resolution && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-sm">Resolution</p>
                <p className="text-sm sm:text-base text-gray-700 break-words">{complaint.resolution}</p>
                {complaint.resolvedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status Update Section */}
          {canUpdateStatus && (
            <div className="border-t pt-4 sm:pt-6">
              {!showStatusUpdate ? (
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="btn-outline w-full sm:w-auto"
                >
                  Update Status
                </button>
              ) : (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-900">Update Status</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="input"
                    >
                      <option value="">Select Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {newStatus === 'resolved' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution Details
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                        className="input"
                        placeholder="Describe how the complaint was resolved..."
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdating}
                      className="btn-primary w-full sm:w-auto"
                    >
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStatusUpdate(false)
                        setNewStatus('')
                        setResolution('')
                      }}
                      className="btn-outline w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Updates Timeline */}
          <div className="border-t pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Updates & Comments</h4>
            
            {complaint.updates && complaint.updates.length > 0 ? (
              <div className="space-y-4">
                {complaint.updates.map((update) => (
                  <div key={update.id} className="flex space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getUpdateTypeIcon(update.updateType)}
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {update.updater?.firstName} {update.updater?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {update.updater?.role?.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {new Date(update.createdAt).toLocaleDateString()} at{' '}
                            {new Date(update.createdAt).toLocaleTimeString()}
                          </p>
                          {update.updateType === 'status_change' && (
                            <p className="text-xs text-blue-600">
                              {update.previousValue} → {update.newValue}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {update.message && (
                        <p className="text-sm text-gray-700 break-words">{update.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No updates yet</p>
            )}
          </div>

          {/* Add Comment Section */}
          {canAddComments && (
            <div className="border-t pt-4 sm:pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Add Update</h4>
              
              <div className="space-y-3">
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Add a comment or update..."
                />

                <button
                  onClick={handleAddUpdate}
                  disabled={isUpdating || !newUpdate.trim()}
                  className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span>{isUpdating ? 'Adding...' : 'Add Update'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComplaintDetailModal