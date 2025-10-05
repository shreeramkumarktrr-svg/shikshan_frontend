import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../utils/api'
import ResponsiveCard from '../components/ResponsiveCard'
import ResponsiveModal from '../components/ResponsiveModal'
import { FormButton, FormInput, FormSelect, FormTextarea, FormField, FormLabel, FormHelp } from '../components/ResponsiveForm'
import PageHeader from '../components/PageHeader'
import {
  UserIcon,
  PencilIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

function Profile() {
  const { user, updateUser } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authAPI.updateProfile(profileForm)
      if (response.data.user) {
        updateUser(response.data.user)
        setSuccess('Profile updated successfully!')
        setShowEditModal(false)
        // Reset form
        setProfileForm({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          dateOfBirth: response.data.user.dateOfBirth ? response.data.user.dateOfBirth.split('T')[0] : '',
          gender: response.data.user.gender || ''
        })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setSuccess('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your account settings and preferences"
      />

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Profile Information */}
      <ResponsiveCard title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(user?.dateOfBirth)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{user?.address || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user?.gender || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <FormButton
            variant="primary"
            onClick={() => setShowEditModal(true)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Edit Profile
          </FormButton>
          <FormButton
            variant="secondary"
            onClick={() => setShowPasswordModal(true)}
            icon={<KeyIcon className="h-4 w-4" />}
          >
            Change Password
          </FormButton>
        </div>
      </ResponsiveCard>

      {/* Account Information */}
      <ResponsiveCard title="Account Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">School</label>
            <p className="mt-1 text-sm text-gray-900">{user?.school?.name || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
              user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </ResponsiveCard>

      {/* Edit Profile Modal */}
      <ResponsiveModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <FormLabel required>First Name</FormLabel>
              <FormInput
                placeholder="Enter your first name"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                required
              />
            </FormField>
            
            <FormField>
              <FormLabel required>Last Name</FormLabel>
              <FormInput
                placeholder="Enter your last name"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                required
              />
            </FormField>
            
            <FormField>
              <FormLabel required>Phone</FormLabel>
              <FormInput
                placeholder="Enter your phone number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                required
              />
            </FormField>
            
            <FormField>
              <FormLabel>Date of Birth</FormLabel>
              <FormInput
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
              />
            </FormField>
            
            <FormField>
              <FormLabel>Gender</FormLabel>
              <FormSelect
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </FormSelect>
            </FormField>
          </div>
          
          <FormField>
            <FormLabel>Address</FormLabel>
            <FormTextarea
              placeholder="Enter your address"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              rows={3}
            />
          </FormField>
          
          <div className="flex justify-end space-x-3 pt-4">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              loading={loading}
            >
              Update Profile
            </FormButton>
          </div>
        </form>
      </ResponsiveModal>

      {/* Change Password Modal */}
      <ResponsiveModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <FormField>
            <FormLabel required>Current Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </FormField>
          
          <FormField>
            <FormLabel required>New Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Enter your new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
            <FormHelp>Password must be at least 6 characters</FormHelp>
          </FormField>
          
          <FormField>
            <FormLabel required>Confirm New Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Confirm your new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </FormField>
          
          <div className="flex justify-end space-x-3 pt-4">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              loading={loading}
            >
              Change Password
            </FormButton>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  )
}

export default Profile