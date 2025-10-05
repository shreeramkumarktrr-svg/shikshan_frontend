import { useState } from 'react'
import { 
  XMarkIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import UserActivityLog from './UserActivityLog'

function UserDetailModal({ user, onClose, onEdit, onChangePassword, onDelete }) {
  const [activeTab, setActiveTab] = useState('profile')
  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      school_admin: 'bg-purple-100 text-purple-800',
      principal: 'bg-indigo-100 text-indigo-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      parent: 'bg-yellow-100 text-yellow-800',
      finance_officer: 'bg-orange-100 text-orange-800',
      support_staff: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <span className={`badge ${getRoleColor(user.role)}`}>
              {user.role.replace('_', ' ')}
            </span>
            <span className={`badge ${
              user.isActive ? 'badge-success' : 'badge-danger'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit User"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {onChangePassword && (
              <button
                onClick={onChangePassword}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Change Password"
              >
                <KeyIcon className="h-5 w-5" />
              </button>
            )}
            {onDelete && user.role !== 'super_admin' && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Deactivate User"
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-5 w-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Activity Log
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {user.profilePic ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.profilePic}
                  alt=""
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
              {user.employeeId && (
                <p className="text-sm text-gray-500">Employee ID: {user.employeeId}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{user.email}</span>
                  {user.emailVerified && (
                    <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                <span>{user.phone}</span>
                {user.phoneVerified && (
                  <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(user.dateOfBirth)}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                <div className="text-gray-600 capitalize">
                  {user.gender || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          {user.address && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
              <div className="flex items-start text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                <span>{user.address}</span>
              </div>
            </div>
          )}

          {/* Subjects (for teachers) */}
          {user.role === 'teacher' && user.subjects && user.subjects.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects</h3>
              <div className="flex items-center text-gray-600">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {user.subjects.map((subject, index) => (
                    <span key={index} className="badge bg-blue-100 text-blue-800">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* School Information */}
          {user.school && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">School</h3>
              <div className="text-gray-600">{user.school.name}</div>
            </div>
          )}

          {/* Emergency Contact */}
          {user.emergencyContact && (user.emergencyContact.name || user.emergencyContact.phone) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
              <div className="text-gray-600">
                {user.emergencyContact.name && (
                  <div>{user.emergencyContact.name}</div>
                )}
                {user.emergencyContact.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {user.emergencyContact.phone}
                  </div>
                )}
                {user.emergencyContact.relationship && (
                  <div className="text-sm text-gray-500">
                    Relationship: {user.emergencyContact.relationship}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Joined</label>
                <div className="text-gray-600">{formatDate(user.createdAt)}</div>
              </div>
              
              {user.joiningDate && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Joining Date</label>
                  <div className="text-gray-600">{formatDate(user.joiningDate)}</div>
                </div>
              )}
              
              {user.lastLoginAt && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Last Login</label>
                  <div className="text-gray-600">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">2FA Status</label>
                <div className={`text-sm ${user.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>

              {/* Timestamps */}
              <div className="pt-4 border-t border-gray-200 text-xs text-gray-400 space-y-1">
                <div>Created: {new Date(user.createdAt).toLocaleString()}</div>
                {user.updatedAt !== user.createdAt && (
                  <div>Updated: {new Date(user.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <UserActivityLog 
              userId={user.id} 
              userName={`${user.firstName} ${user.lastName}`}
            />
          )}
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

export default UserDetailModal