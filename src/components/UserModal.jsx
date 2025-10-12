import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

function UserModal({ user, onSave, onClose, isLoading, userType, classes = [] }) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: userType || 'student',
      dateOfBirth: '',
      gender: '',
      address: '',
      employeeId: '',
      subjects: [],
      classId: '',
      rollNumber: '',
      parentName: '',
      parentContact: '',
      parentEmail: '',
      classTeacher: false,
      isActive: true
    }
  })

  const watchRole = watch('role')

  // Populate form when editing
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '', // Don't populate password for existing users
        role: user.role || userType || 'student',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        address: user.address || '',
        employeeId: user.employeeId || '',
        subjects: user.subjects || [],
        classId: user.classId || '',
        rollNumber: user.rollNumber || '',
        parentName: user.parentName || '',
        parentContact: user.parentContact || '',
        parentEmail: user.parentEmail || '',
        classTeacher: user.classTeacher || false,
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    }
  }, [user, reset, userType])

  const onSubmit = (data) => {
    const userData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
      subjects: data.subjects ? data.subjects.filter(subject => subject.trim() !== '') : [],
      isActive: data.isActive === 'true' || data.isActive === true // Convert string to boolean
    }
    
    // Remove password field when updating existing users (password updates should be handled separately)
    if (user) {
      delete userData.password
      
      // If userType is specified (e.g., from Teachers page), don't send role changes
      // This prevents accidental role changes when editing from specific user type pages
      if (userType) {
        delete userData.role
      }
    }
    
    onSave(userData)
  }

  const roles = [
    { value: 'school_admin', label: 'School Admin' },
    { value: 'principal', label: 'Principal' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' },
    { value: 'finance_officer', label: 'Finance Officer' },
    { value: 'support_staff', label: 'Support Staff' }
  ]

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Economics', 'Political Science', 'Psychology'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' }
                  })}
                  type="text"
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' }
                  })}
                  type="text"
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    validate: (value) => {
                      if (!value || value.trim() === '') return true; // Allow empty
                      return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) || 'Invalid email address';
                    }
                  })}
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\d{10,15}$/,
                      message: 'Phone number must be 10-15 digits only'
                    }
                  })}
                  type="tel"
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="Enter 10-15 digit phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Password field for new users */}
            {!user && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter password (minimum 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This will be the user's login password. They can change it later.
                </p>
              </div>
            )}
          </div>

          {/* Role and Personal Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Role & Personal Details</h3>

            <div className="grid grid-cols-2 gap-4">
              {!userType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className={`input ${errors.role ? 'input-error' : ''}`}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select {...register('gender')} className="input">
                  <option value="">Select gender</option>
                  {genders.map(gender => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select {...register('isActive')} className="input">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Inactive users cannot login to the system
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="input"
                />
              </div>

              {(userType === 'teacher' || ['teacher', 'school_admin', 'principal', 'finance_officer', 'support_staff'].includes(watchRole)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    {...register('employeeId')}
                    type="text"
                    className="input"
                    placeholder="Enter employee ID"
                  />
                </div>
              )}

              {userType === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number
                  </label>
                  <input
                    {...register('rollNumber')}
                    type="text"
                    className="input"
                    placeholder="Enter roll number"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="input"
              placeholder="Enter address"
            />
          </div>

          {/* Class Assignment */}
          {(userType === 'student' || userType === 'teacher') && classes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {userType === 'student' ? 'Class Assignment' : 'Class Teacher Assignment'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userType === 'student' ? 'Assign to Class' : 'Class to Teach'}
                  </label>
                  <select {...register('classId')} className="input">
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                {userType === 'teacher' && (
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('classTeacher')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Assign as Class Teacher
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subjects (for teachers) */}
          {(userType === 'teacher' || watchRole === 'teacher') && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subjects</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {commonSubjects.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        value={subject}
                        {...register('subjects')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Parent Information (for students) */}
          {userType === 'student' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    {...register('parentName')}
                    type="text"
                    className="input"
                    placeholder="Enter parent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Contact Number
                  </label>
                  <input
                    {...register('parentContact', {
                      pattern: {
                        value: /^\d{10,15}$/,
                        message: 'Invalid phone number'
                      }
                    })}
                    type="tel"
                    className={`input ${errors.parentContact ? 'input-error' : ''}`}
                    placeholder="Enter parent contact"
                  />
                  {errors.parentContact && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentContact.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Email (Optional)
                </label>
                <input
                  {...register('parentEmail', {
                    validate: (value) => {
                      if (!value || value.trim() === '') return true; // Allow empty
                      return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) || 'Invalid email address';
                    }
                  })}
                  type="email"
                  className={`input ${errors.parentEmail ? 'input-error' : ''}`}
                  placeholder="Enter parent email"
                />
                {errors.parentEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Password Note for existing users */}
          {user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> To change the password for this user, use the password management feature from the user details page.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal