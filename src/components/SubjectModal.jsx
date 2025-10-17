import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

function SubjectModal({ subject, onSave, onClose, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'core',
    isActive: true
  })
  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'core', label: 'Core Subject' },
    { value: 'elective', label: 'Elective' },
    { value: 'extracurricular', label: 'Extracurricular' },
    { value: 'language', label: 'Language' },
    { value: 'science', label: 'Science' },
    { value: 'arts', label: 'Arts' },
    { value: 'sports', label: 'Sports' }
  ]

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        category: subject.category || 'core',
        isActive: subject.isActive !== undefined ? subject.isActive : true
      })
    }
  }, [subject])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Subject name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Subject name must be less than 100 characters'
    }

    if (formData.code && formData.code.trim().length > 20) {
      newErrors.code = 'Subject code must be less than 20 characters'
    }

    if (formData.description && formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    const submitData = {
      name: formData.name.trim(),
      code: formData.code.trim() || null,
      description: formData.description.trim() || null,
      category: formData.category,
      isActive: formData.isActive
    }

    onSave(submitData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {subject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-end sm:self-auto"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Subject Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Mathematics, Physics, English"
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Subject Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`input ${errors.code ? 'input-error' : ''}`}
              placeholder="e.g., MATH, PHY, ENG (optional)"
              maxLength={20}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional short code for the subject
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Brief description of the subject (optional)"
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Active Status */}
          {subject && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (subject is available for use)
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline w-full sm:w-auto order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto order-1 sm:order-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {subject ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                subject ? 'Update Subject' : 'Create Subject'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubjectModal