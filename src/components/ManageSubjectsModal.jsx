import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import SubjectModal from './SubjectModal'
import api from '../utils/api'
import toast from 'react-hot-toast'

function ManageSubjectsModal({ onClose }) {
  const queryClient = useQueryClient()
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    isActive: '',
    search: ''
  })

  // Fetch subjects
  const { data: subjectsData, isLoading, error } = useQuery({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.isActive !== '') params.append('isActive', filters.isActive)
      if (filters.search) params.append('search', filters.search)
      
      const response = await api.get(`/subjects?${params}`)
      return response.data
    }
  })

  // Create subject mutation
  const createSubjectMutation = useMutation({
    mutationFn: (data) => api.post('/subjects', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setShowSubjectModal(false)
      setSelectedSubject(null)
      toast.success('Subject created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create subject')
    }
  })

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setShowSubjectModal(false)
      setSelectedSubject(null)
      toast.success('Subject updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update subject')
    }
  })

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: (id) => api.delete(`/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects'])
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success('Subject deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete subject')
    }
  })

  const handleCreateSubject = () => {
    setSelectedSubject(null)
    setShowSubjectModal(true)
  }

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject)
    setShowSubjectModal(true)
  }

  const handleDeleteSubject = (subject) => {
    if (window.confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      deleteSubjectMutation.mutate(subject.id)
    }
  }

  const handleSaveSubject = (data) => {
    if (selectedSubject) {
      updateSubjectMutation.mutate({ id: selectedSubject.id, data })
    } else {
      createSubjectMutation.mutate(data)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      core: 'bg-blue-100 text-blue-800',
      elective: 'bg-green-100 text-green-800',
      extracurricular: 'bg-purple-100 text-purple-800',
      language: 'bg-yellow-100 text-yellow-800',
      science: 'bg-red-100 text-red-800',
      arts: 'bg-pink-100 text-pink-800',
      sports: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const subjects = subjectsData?.data || []
  
  const categories = [
    { value: 'core', label: 'Core Subject' },
    { value: 'elective', label: 'Elective' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'language', label: 'Language' },
    { value: 'science', label: 'Science' },
    { value: 'arts', label: 'Arts' },
    { value: 'sports', label: 'Sports' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Manage Subjects
            </h2>
            <p className="text-sm text-gray-600">
              Add, edit, or remove subjects for your school
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-end sm:self-auto"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <button
              onClick={handleCreateSubject}
              className="btn-primary w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Subject
            </button>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input pl-10 text-sm w-full sm:w-48"
                />
              </div>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input text-sm w-full sm:w-auto"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="input text-sm w-full sm:w-auto"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Subjects List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {isLoading ? (
              <LoadingSpinner centered size="md" className="py-8" />
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                Error loading subjects: {error.message}
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-sm sm:text-base">No subjects found</div>
                <button
                  onClick={handleCreateSubject}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Create your first subject
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{subject.name}</h4>
                              {subject.code && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {subject.code}
                                </span>
                              )}
                            </div>
                            {subject.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{subject.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getCategoryColor(subject.category)}`}>
                              {categories.find(c => c.value === subject.category)?.label}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              subject.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Created by {subject.creator?.firstName} {subject.creator?.lastName}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject)}
                              className="text-red-600 hover:text-red-900 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                              {subject.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{subject.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {subject.code ? (
                              <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {subject.code}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getCategoryColor(subject.category)}`}>
                              {categories.find(c => c.value === subject.category)?.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              subject.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {subject.creator?.firstName} {subject.creator?.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Subject"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Subject"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline w-full sm:w-auto"
          >
            Close
          </button>
        </div>

        {/* Subject Modal */}
        {showSubjectModal && (
          <SubjectModal
            subject={selectedSubject}
            onSave={handleSaveSubject}
            onClose={() => {
              setShowSubjectModal(false)
              setSelectedSubject(null)
            }}
            isLoading={createSubjectMutation.isLoading || updateSubjectMutation.isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default ManageSubjectsModal