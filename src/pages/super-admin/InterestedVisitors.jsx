import { useState, useEffect } from 'react'
import api from '../../utils/api'
import ResponsiveTable from '../../components/ResponsiveTable'
import ResponsiveModal from '../../components/ResponsiveModal'
import ResponsiveCard from '../../components/ResponsiveCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import PageHeader from '../../components/PageHeader'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Demo Planned', label: 'Demo Planned', color: 'bg-blue-100 text-blue-800' },
  { value: 'Demo Done', label: 'Demo Done', color: 'bg-purple-100 text-purple-800' },
  { value: 'Denied', label: 'Denied', color: 'bg-red-100 text-red-800' },
  { value: 'Onboarded', label: 'Onboarded', color: 'bg-green-100 text-green-800' }
]

function InterestedVisitors() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({})
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInquiries, setTotalInquiries] = useState(0)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  })

  useEffect(() => {
    fetchInquiries()
    fetchStats()
  }, [currentPage, searchTerm, statusFilter])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await api.get(`/contact/inquiries?${params}`)
      
      if (response.data.success) {
        const inquiries = response.data.data.inquiries || []
        setInquiries(inquiries)
        setTotalPages(response.data.data.pagination?.totalPages || 1)
        setTotalInquiries(response.data.data.pagination?.total || 0)
      }
    } catch (err) {
      setError('Failed to fetch inquiries')
      console.error('Fetch inquiries error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/contact/inquiries/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err) {
      console.error('Fetch stats error:', err)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const response = await api.put(`/contact/inquiries/${selectedInquiry.id}/status`, statusForm)
      
      if (response.data.success) {
        setShowStatusModal(false)
        setSelectedInquiry(null)
        setStatusForm({ status: '', notes: '' })
        fetchInquiries()
        fetchStats()
      }
    } catch (err) {
      setError('Failed to update inquiry status')
      console.error('Update status error:', err)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/contact/inquiries/${selectedInquiry.id}`)
      
      if (response.data.success) {
        setShowDeleteModal(false)
        setSelectedInquiry(null)
        fetchInquiries()
        fetchStats()
      }
    } catch (err) {
      setError('Failed to delete inquiry')
      console.error('Delete inquiry error:', err)
    }
  }

  const openStatusModal = (inquiry) => {
    setSelectedInquiry(inquiry)
    setStatusForm({
      status: inquiry.status,
      notes: inquiry.notes || ''
    })
    setShowStatusModal(true)
  }

  const openDetailModal = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowDetailModal(true)
  }

  const openDeleteModal = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowDeleteModal(true)
  }

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusOption?.label || status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, inquiry) => {
        if (!inquiry) return <div>-</div>
        return (
          <div>
            <div className="font-medium text-gray-900">{inquiry.name || 'N/A'}</div>
            {inquiry.designation && (
              <div className="text-sm text-gray-500">{inquiry.designation}</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, inquiry) => {
        if (!inquiry) return <div>-</div>
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-900">
              <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
              <a href={`mailto:${inquiry.email || ''}`} className="hover:text-primary-600">
                {inquiry.email || 'N/A'}
              </a>
            </div>
            <div className="flex items-center text-sm text-gray-900">
              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
              <a href={`tel:${inquiry.phone || ''}`} className="hover:text-primary-600">
                {inquiry.phone || 'N/A'}
              </a>
            </div>
          </div>
        )
      }
    },
    {
      key: 'schoolName',
      label: 'School',
      render: (value, inquiry) => {
        if (!inquiry) return <div>-</div>
        return (
          <div className="font-medium text-gray-900">{inquiry.schoolName || 'N/A'}</div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, inquiry) => {
        if (!inquiry) return <div>-</div>
        return getStatusBadge(inquiry.status || 'Pending')
      }
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (value, inquiry) => {
        if (!inquiry || !inquiry.createdAt) return <div>-</div>
        return (
          <div className="text-sm text-gray-900">{formatDate(inquiry.createdAt)}</div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, inquiry) => {
        if (!inquiry) return <div>-</div>
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => openDetailModal(inquiry)}
              className="text-gray-400 hover:text-gray-600"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => openStatusModal(inquiry)}
              className="text-primary-400 hover:text-primary-600"
              title="Update Status"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => openDeleteModal(inquiry)}
              className="text-red-400 hover:text-red-600"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )
      }
    }
  ]

  if (loading && inquiries.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interested Visitors"
        subtitle="Manage inquiries from the landing page contact form"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats.statusCounts && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATUS_OPTIONS.map((status) => (
            <ResponsiveCard key={status.value} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.statusCounts[status.value] || 0}
              </div>
              <div className="text-sm text-gray-600">{status.label}</div>
            </ResponsiveCard>
          ))}
        </div>
      )}

      {/* Filters */}
      <ResponsiveCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </ResponsiveCard>

      {/* Inquiries Table */}
      <ResponsiveCard>
        <ResponsiveTable
          data={inquiries}
          columns={columns}
          loading={loading}
          emptyMessage="No inquiries found"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, totalInquiries)}</span> of{' '}
                  <span className="font-medium">{totalInquiries}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </ResponsiveCard>

      {/* Detail Modal */}
      <ResponsiveModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Inquiry Details"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
              </div>
              {selectedInquiry.designation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedInquiry.designation}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${selectedInquiry.email}`} className="text-primary-600 hover:text-primary-500">
                    {selectedInquiry.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">
                  <a href={`tel:${selectedInquiry.phone}`} className="text-primary-600 hover:text-primary-500">
                    {selectedInquiry.phone}
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.schoolName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInquiry.createdAt)}</p>
              </div>
            </div>
            
            {selectedInquiry.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.description}</p>
              </div>
            )}
            
            {selectedInquiry.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.notes}</p>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>

      {/* Status Update Modal */}
      <ResponsiveModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Status"
        size="md"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inquiry from {selectedInquiry.name}
              </label>
              <p className="text-sm text-gray-500">{selectedInquiry.schoolName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add any notes about this inquiry..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Update Status
              </button>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Delete Confirmation Modal */}
      <ResponsiveModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Inquiry"
        size="sm"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the inquiry from <strong>{selectedInquiry.name}</strong> ({selectedInquiry.schoolName})? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  )
}

export default InterestedVisitors