import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import EventModal from '../components/EventModal'
import EventDetailModal from '../components/EventDetailModal'

function Events() {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    published: ''
  })
  const [page, setPage] = useState(1)

  // Fetch events
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', filters, page],
    queryFn: () => eventsAPI.getAll({ 
      ...filters, 
      page, 
      limit: 10 
    }),
    keepPreviousData: true
  })

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      setIsCreateModalOpen(false)
      toast.success('Event created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create event')
    }
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => eventsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      setSelectedEvent(null)
      toast.success('Event updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update event')
    }
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: eventsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      toast.success('Event deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete event')
    }
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: eventsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
    }
  })

  const handleCreateEvent = (eventData) => {
    createEventMutation.mutate(eventData)
  }

  const handleUpdateEvent = (eventData) => {
    updateEventMutation.mutate({
      id: selectedEvent.id,
      data: eventData
    })
  }

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId)
    }
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setIsDetailModalOpen(true)
    
    // Mark as read if user is student or parent
    if (['student', 'parent'].includes(user.role)) {
      markAsReadMutation.mutate(event.id)
    }
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsCreateModalOpen(true)
  }

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

  const canManageEvents = hasRole(['super_admin', 'school_admin', 'principal', 'teacher'])

  if (isLoading) return <LoadingSpinner centered size="lg" />
  if (error) return <div className="text-red-600">Error loading events</div>

  const events = eventsData?.data?.events || []
  const pagination = eventsData?.data?.pagination || {}

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events & Announcements</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage school events and announcements</p>
        </div>
        {canManageEvents && (
          <button
            onClick={() => {
              setSelectedEvent(null)
              setIsCreateModalOpen(true)
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400 hidden sm:block" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1 w-full">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input w-full"
              >
                <option value="">All Types</option>
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="celebration">Celebration</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="input w-full"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              {canManageEvents && (
                <select
                  value={filters.published}
                  onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                  className="input w-full"
                >
                  <option value="">All Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                {canManageEvents 
                  ? "Create your first event to get started."
                  : "No events have been published yet."
                }
              </p>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{event.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`badge text-xs ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {!event.isPublished && (
                          <span className="badge bg-gray-100 text-gray-800 text-xs">Draft</span>
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    )}

                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-2 text-sm text-gray-500">
                      {event.startDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          <ClockIcon className="h-4 w-4 ml-3 mr-1 flex-shrink-0" />
                          <span>{new Date(event.startDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.targetAudience.join(', ')}</span>
                      </div>

                      <div className={`flex items-center ${getPriorityColor(event.priority)}`}>
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{event.priority} Priority</span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center space-x-6 text-sm text-gray-500">
                      {event.startDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {event.startDate && (
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(event.startDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}

                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {event.targetAudience.join(', ')}
                      </div>

                      <div className={`flex items-center ${getPriorityColor(event.priority)}`}>
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {event.priority}
                      </div>
                    </div>

                    {event.creator && (
                      <div className="mt-2 text-xs text-gray-400">
                        Created by {event.creator.firstName} {event.creator.lastName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-3 sm:mt-0 sm:ml-4 justify-end sm:justify-start">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {canManageEvents && (
                      <>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Event"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Event"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-outline disabled:opacity-50 w-full sm:w-auto"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="btn-outline disabled:opacity-50 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <EventModal
          event={selectedEvent}
          onSave={selectedEvent ? handleUpdateEvent : handleCreateEvent}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedEvent(null)
          }}
          isLoading={createEventMutation.isLoading || updateEventMutation.isLoading}
        />
      )}

      {isDetailModalOpen && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedEvent(null)
          }}
          onEdit={canManageEvents ? () => {
            setIsDetailModalOpen(false)
            handleEditEvent(selectedEvent)
          } : null}
          onDelete={canManageEvents ? () => {
            setIsDetailModalOpen(false)
            handleDeleteEvent(selectedEvent.id)
          } : null}
        />
      )}
    </div>
  )
}

export default Events