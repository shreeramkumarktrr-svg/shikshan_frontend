import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  KeyIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { usersAPI } from '../utils/api'
import toast from 'react-hot-toast'

function UserPermissions({ user, onClose }) {
  const queryClient = useQueryClient()
  const [permissions, setPermissions] = useState({
    canViewReports: false,
    canManageEvents: false,
    canManageAttendance: false,
    canManageUsers: false,
    canManageClasses: false,
    canManageFees: false,
    canViewAllStudents: false,
    canExportData: false,
    canManageComplaints: false,
    canAccessSettings: false
  })

  useEffect(() => {
    // Set default permissions based on role
    const rolePermissions = getRolePermissions(user.role)
    setPermissions(rolePermissions)
  }, [user.role])

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ userId, permissions }) => usersAPI.updatePermissions(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Permissions updated successfully!')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update permissions')
    }
  })

  const getRolePermissions = (role) => {
    const roleDefaults = {
      super_admin: {
        canViewReports: true,
        canManageEvents: true,
        canManageAttendance: true,
        canManageUsers: true,
        canManageClasses: true,
        canManageFees: true,
        canViewAllStudents: true,
        canExportData: true,
        canManageComplaints: true,
        canAccessSettings: true
      },
      school_admin: {
        canViewReports: true,
        canManageEvents: true,
        canManageAttendance: true,
        canManageUsers: true,
        canManageClasses: true,
        canManageFees: true,
        canViewAllStudents: true,
        canExportData: true,
        canManageComplaints: true,
        canAccessSettings: true
      },
      principal: {
        canViewReports: true,
        canManageEvents: true,
        canManageAttendance: true,
        canManageUsers: true,
        canManageClasses: true,
        canManageFees: false,
        canViewAllStudents: true,
        canExportData: true,
        canManageComplaints: true,
        canAccessSettings: false
      },
      teacher: {
        canViewReports: false,
        canManageEvents: false,
        canManageAttendance: true,
        canManageUsers: false,
        canManageClasses: false,
        canManageFees: false,
        canViewAllStudents: false,
        canExportData: false,
        canManageComplaints: false,
        canAccessSettings: false
      },
      finance_officer: {
        canViewReports: true,
        canManageEvents: false,
        canManageAttendance: false,
        canManageUsers: false,
        canManageClasses: false,
        canManageFees: true,
        canViewAllStudents: true,
        canExportData: true,
        canManageComplaints: false,
        canAccessSettings: false
      },
      support_staff: {
        canViewReports: false,
        canManageEvents: false,
        canManageAttendance: false,
        canManageUsers: false,
        canManageClasses: false,
        canManageFees: false,
        canViewAllStudents: false,
        canExportData: false,
        canManageComplaints: true,
        canAccessSettings: false
      }
    }

    return roleDefaults[role] || {
      canViewReports: false,
      canManageEvents: false,
      canManageAttendance: false,
      canManageUsers: false,
      canManageClasses: false,
      canManageFees: false,
      canViewAllStudents: false,
      canExportData: false,
      canManageComplaints: false,
      canAccessSettings: false
    }
  }

  const handlePermissionChange = (permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }))
  }

  const handleSave = () => {
    updatePermissionsMutation.mutate({
      userId: user.id,
      permissions
    })
  }

  const resetToDefaults = () => {
    const rolePermissions = getRolePermissions(user.role)
    setPermissions(rolePermissions)
  }

  const permissionGroups = [
    {
      title: 'User Management',
      permissions: [
        { key: 'canManageUsers', label: 'Manage Users', description: 'Create, edit, and deactivate users' },
        { key: 'canViewAllStudents', label: 'View All Students', description: 'Access all student profiles and data' }
      ]
    },
    {
      title: 'Academic Management',
      permissions: [
        { key: 'canManageClasses', label: 'Manage Classes', description: 'Create and manage class schedules and assignments' },
        { key: 'canManageAttendance', label: 'Manage Attendance', description: 'Mark and modify attendance records' },
        { key: 'canManageEvents', label: 'Manage Events', description: 'Create and manage school events and announcements' }
      ]
    },
    {
      title: 'Financial Management',
      permissions: [
        { key: 'canManageFees', label: 'Manage Fees', description: 'Handle fee structures, invoices, and payments' }
      ]
    },
    {
      title: 'Reports & Data',
      permissions: [
        { key: 'canViewReports', label: 'View Reports', description: 'Access various school reports and analytics' },
        { key: 'canExportData', label: 'Export Data', description: 'Export data in various formats' }
      ]
    },
    {
      title: 'Support & Settings',
      permissions: [
        { key: 'canManageComplaints', label: 'Manage Complaints', description: 'Handle and respond to complaints' },
        { key: 'canAccessSettings', label: 'Access Settings', description: 'Modify system settings and configurations' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                User Permissions
              </h2>
              <p className="text-sm text-gray-500">
                {user.firstName} {user.lastName} - {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Warning for sensitive roles */}
        {['super_admin', 'school_admin'].includes(user.role) && (
          <div className="p-4 bg-yellow-50 border-b">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This user has administrative privileges. 
                Modifying permissions may affect system security.
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {permissionGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2 text-gray-400" />
                  {group.title}
                </h3>
                
                <div className="space-y-4">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <KeyIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {permission.label}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions[permission.key]}
                            onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={resetToDefaults}
            className="btn-outline"
          >
            Reset to Role Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-outline"
              disabled={updatePermissionsMutation.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={updatePermissionsMutation.isLoading}
            >
              {updatePermissionsMutation.isLoading ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPermissions