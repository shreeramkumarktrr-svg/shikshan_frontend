import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

function EventDetailModal({ event, onClose, onEdit, onDelete }) {
  const getEventTypeColor = (type) => {
    const colors = {
      announcement: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      holiday: 'bg-yellow-100 text-yellow-800',
      exam: 'bg-red-100 text-red-800',
      meeting: 'bg-purple-100 text-purple-800',
      celebration: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    }
    return colors[priority] || 'text-gray-500'
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const startDateTime = formatDateTime(event.startDate)
  const endDateTime = formatDateTime(event.endDate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            <span className={`badge ${getEventTypeColor(event.type)}`}>
              {event.type}
            </span>
            {!event.isPublished && (
              <span className="badge bg-gray-100 text-gray-800">Draft</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Event"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Event"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <div className={`flex items-center ${getPriorityColor(event.priority)}`}>
                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium capitalize">{event.priority} Priority</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          {(startDateTime || endDateTime) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Date & Time</h3>
              <div className="space-y-2">
                {startDateTime && (
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{startDateTime.date}</div>
                      <div className="text-sm flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {startDateTime.time}
                        {endDateTime && ` - ${endDateTime.time}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                {event.location}
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Target Audience</h3>
            <div className="flex items-center text-gray-600">
              <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {event.targetAudience.map((audience, index) => (
                  <span key={audience} className="badge bg-gray-100 text-gray-800 capitalize">
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Class Information */}
          {event.class && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Class</h3>
              <div className="text-gray-600">
                {event.class.name} ({event.class.grade}-{event.class.section})
              </div>
            </div>
          )}

          {/* Creator Information */}
          {event.creator && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Created By</h3>
              <div className="text-gray-600">
                {event.creator.firstName} {event.creator.lastName}
                <span className="text-gray-400 ml-2">({event.creator.role.replace('_', ' ')})</span>
              </div>
            </div>
          )}

          {/* Notification Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-500">Notifications:</span>
                <span className={`ml-2 ${event.sendNotification ? 'text-green-600' : 'text-gray-400'}`}>
                  {event.sendNotification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 ${event.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                  {event.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-400 space-y-1">
            <div>Created: {new Date(event.createdAt).toLocaleString()}</div>
            {event.updatedAt !== event.createdAt && (
              <div>Updated: {new Date(event.updatedAt).toLocaleString()}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end">
            <button onClick={onClose} className="btn-outline">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailModal