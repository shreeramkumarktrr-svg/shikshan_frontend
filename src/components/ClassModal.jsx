import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'
import { subjectsAPI } from '../utils/api'

function ClassModal({ class: classData, teachers = [], onSave, onClose, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      grade: '',
      section: '',
      classTeacherId: '',
      maxStudents: 40,
      room: '',
      subjects: []
    }
  })

  const watchSubjects = watch('subjects')

  // Populate form when editing
  useEffect(() => {
    if (classData) {
      reset({
        name: classData.name || '',
        grade: classData.grade || '',
        section: classData.section || '',
        classTeacherId: classData.classTeacherId || '',
        maxStudents: classData.maxStudents || 40,
        room: classData.room || '',
        subjects: classData.subjects || []
      })
    }
  }, [classData, reset])

  const onSubmit = (data) => {
    const classPayload = {
      ...data,
      maxStudents: parseInt(data.maxStudents),
      subjects: data.subjects.filter(subject => subject.trim() !== '')
    }
    onSave(classPayload)
  }

  const grades = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ]

  const sections = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
  ]

  // Fetch subjects from API
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useQuery({
    queryKey: ['subjects', { isActive: 'true' }],
    queryFn: async () => {
      const response = await subjectsAPI.getAll({ isActive: 'true' })
      return response.data // Return just the data part
    },
    retry: 1,
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
    onError: (error) => {
      console.error('Error fetching subjects:', error)
    }
  })

  // Refetch subjects when modal opens
  useEffect(() => {
    refetchSubjects()
  }, [])

  // Ensure subjects is always an array
  const subjects = React.useMemo(() => {
    console.log('ClassModal - subjectsData:', subjectsData);
    if (subjectsData?.data && Array.isArray(subjectsData.data)) {
      console.log('ClassModal - subjects found:', subjectsData.data.length);
      return subjectsData.data;
    }
    console.log('ClassModal - no subjects found, subjectsData structure:', subjectsData);
    return [];
  }, [subjectsData])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {classData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  {...register('name', { 
                    required: 'Class name is required',
                    minLength: { value: 1, message: 'Minimum 1 character' }
                  })}
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g., Class 10A, Grade 5B"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select 
                  {...register('grade', { required: 'Grade is required' })}
                  className={`input ${errors.grade ? 'input-error' : ''}`}
                >
                  <option value="">Select grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select 
                  {...register('section', { required: 'Section is required' })}
                  className={`input ${errors.section ? 'input-error' : ''}`}
                >
                  <option value="">Select section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Teacher
                </label>
                <select 
                  {...register('classTeacherId')}
                  className="input"
                >
                  <option value="">Select class teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Capacity and Room */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Capacity & Location</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Students *
                </label>
                <input
                  {...register('maxStudents', { 
                    required: 'Maximum students is required',
                    min: { value: 1, message: 'Minimum 1 student' },
                    max: { value: 100, message: 'Maximum 100 students' }
                  })}
                  type="number"
                  min="1"
                  max="100"
                  className={`input ${errors.maxStudents ? 'input-error' : ''}`}
                  placeholder="40"
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  {...register('room')}
                  type="text"
                  className="input"
                  placeholder="e.g., Room 101, Lab A"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Subjects</h3>
              <button
                type="button"
                onClick={() => refetchSubjects()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {subjectsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : subjectsError ? (
                <div className="text-center py-4 text-red-500">
                  <p className="text-sm">Error loading subjects</p>
                  <p className="text-xs mt-1">{subjectsError.message}</p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No subjects available</p>
                  <p className="text-xs mt-1">Create subjects using "Manage Subjects" first</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <label key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={subject.name}
                        {...register('subjects')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {subject.name}
                        {subject.code && (
                          <span className="text-xs text-gray-500 ml-1">({subject.code})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                Selected: {watchSubjects?.length || 0} subjects
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
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
                  {classData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                classData ? 'Update Class' : 'Create Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassModal