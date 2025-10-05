import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  KeyIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UserCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import UserModal from '../components/UserModal'
import UserDetailModal from '../components/UserDetailModal'
import PasswordModal from '../components/PasswordModal'
import BulkUserImport from '../components/BulkUserImport'
import ResponsiveCard, { CardGrid, StatCard } from '../components/ResponsiveCard'
import ResponsiveTable from '../components/ResponsiveTable'
import { FormButton, FormInput, FormSelect } from '../components/ResponsiveForm'
import PageHeader from '../components/PageHeader'

function Users() {
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({
    role: '',
    active: '',
    search: ''
  })
  const [page, setPage] = useState(1)

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', filters, page],
    queryFn: () => usersAPI.getAll({ 
      ...filters, 
      page, 
      limit: 10 
    }),
    keepPreviousData: true,
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Failed to fetch users:', error);
    }
  })

  // Fetch user statistics
  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersAPI.getStats(),
    enabled: hasRole(['super_admin', 'school_admin', 'principal']),
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Failed to fetch user stats:', error);
    }
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user-stats'])
      setIsCreateModalOpen(false)
      toast.success(`User created successfully! Default password: ${response.data.defaultPassword}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create user')
    }
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user-stats'])
      setSelectedUser(null)
      toast.success('User updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update user')
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user-stats'])
      toast.success('User deactivated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to deactivate user')
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.changePassword(id, data),
    onSuccess: () => {
      setIsPasswordModalOpen(false)
      setSelectedUser(null)
      toast.success('Password changed successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password')
    }
  })

  const handleCreateUser = (userData) => {
    createUserMutation.mutate(userData)
  }

  const handleUpdateUser = (userData) => {
    updateUserMutation.mutate({
      id: selectedUser.id,
      data: userData
    })
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsCreateModalOpen(true)
  }

  const handleChangePassword = (user) => {
    setSelectedUser(user)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordChange = (passwordData) => {
    changePasswordMutation.mutate({
      id: selectedUser.id,
      data: passwordData
    })
  }

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

  const getRoleIcon = (role) => {
    const icons = {
      super_admin: UserCircleIcon,
      school_admin: UserCircleIcon,
      principal: UserCircleIcon,
      teacher: AcademicCapIcon,
      student: UserIcon,
      parent: UserGroupIcon,
      finance_officer: UserIcon,
      support_staff: UserIcon
    }
    const IconComponent = icons[role] || UserIcon
    return <IconComponent className="h-5 w-5" />
  }

  const canManageUsers = hasRole(['super_admin', 'school_admin', 'principal'])

  // Table columns configuration
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (value, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.profilePic ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.profilePic}
                alt=""
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            {user.employeeId && (
              <div className="text-sm text-gray-500">
                ID: {user.employeeId}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`badge ${getRoleColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, user) => (
        <div className="space-y-1 text-sm text-gray-500">
          {user.email && (
            <div className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{user.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, user) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleViewUser(user)}
            className="text-gray-400 hover:text-gray-600 transition-colors touch-target"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          {canManageUsers && (
            <>
              <button
                onClick={() => handleEditUser(user)}
                className="text-gray-400 hover:text-blue-600 transition-colors touch-target"
                title="Edit User"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleChangePassword(user)}
                className="text-gray-400 hover:text-green-600 transition-colors touch-target"
                title="Change Password"
              >
                <KeyIcon className="h-5 w-5" />
              </button>
              
              {user.role !== 'super_admin' && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors touch-target"
                  title="Deactivate User"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  if (isLoading) return <LoadingSpinner />
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Backend Server Not Available</h3>
          <p className="text-sm text-gray-500 mb-4">
            The API server is not running on port 5000. Please start the backend server to access user management features.
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Step 1: Open a new terminal</p>
              <p className="text-xs text-gray-400 mb-1">Step 2: Navigate to backend folder</p>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                cd backend
              </code>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Step 3: Start the server</p>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                npm start
              </code>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Expected output:</p>
              <code className="block bg-green-50 p-2 rounded text-xs text-green-700">
                Server running on port 5000
              </code>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.open('http://localhost:5000/health', '_blank')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Test Backend
            </button>
          </div>
        </div>
      </div>
    )
  }

  const users = usersData?.data?.users || []
  const pagination = usersData?.data?.pagination || {}
  const stats = statsData?.data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Users Management"
        subtitle="Manage students, teachers, parents, and staff"
        actions={canManageUsers ? [
          {
            label: 'Bulk Import',
            variant: 'outline',
            icon: <DocumentArrowUpIcon className="h-5 w-5" />,
            onClick: () => setIsBulkImportOpen(true),
            primary: false
          },
          {
            label: 'Add User',
            variant: 'primary',
            icon: <PlusIcon className="h-5 w-5" />,
            onClick: () => {
              setSelectedUser(null)
              setIsCreateModalOpen(true)
            },
            primary: true
          }
        ] : []}
      />

      {/* Statistics */}
      {canManageUsers && stats.usersByRole && (
        <CardGrid columns="auto">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <StatCard
              key={role}
              title={role.replace('_', ' ')}
              value={count}
              icon={getRoleIcon(role)}
            />
          ))}
        </CardGrid>
      )}

      {/* Filters and Search */}
      <ResponsiveCard>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <FormInput
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center text-gray-400">
              <FunnelIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Filters:</span>
            </div>
            
            <FormSelect
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="">All Roles</option>
              <option value="school_admin">School Admin</option>
              <option value="principal">Principal</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="finance_officer">Finance Officer</option>
              <option value="support_staff">Support Staff</option>
            </FormSelect>

            <FormSelect
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="w-full sm:w-32"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FormSelect>
          </div>
        </div>
      </ResponsiveCard>

      {/* Users List */}
      <ResponsiveTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage={
          canManageUsers 
            ? "Add your first user to get started."
            : "No users match your current filters."
        }
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <FormButton
            variant="secondary"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </FormButton>
          <span className="px-4 py-2 text-sm text-gray-700 order-first sm:order-none">
            Page {page} of {pagination.pages}
          </span>
          <FormButton
            variant="secondary"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
          >
            Next
          </FormButton>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <UserModal
          user={selectedUser}
          onSave={selectedUser ? handleUpdateUser : handleCreateUser}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedUser(null)
          }}
          isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
        />
      )}

      {isDetailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedUser(null)
          }}
          onEdit={canManageUsers ? () => {
            setIsDetailModalOpen(false)
            handleEditUser(selectedUser)
          } : null}
          onChangePassword={canManageUsers ? () => {
            setIsDetailModalOpen(false)
            handleChangePassword(selectedUser)
          } : null}
          onDelete={canManageUsers ? () => {
            setIsDetailModalOpen(false)
            handleDeleteUser(selectedUser.id)
          } : null}
        />
      )}

      {isPasswordModalOpen && selectedUser && (
        <PasswordModal
          user={selectedUser}
          onSave={handlePasswordChange}
          onClose={() => {
            setIsPasswordModalOpen(false)
            setSelectedUser(null)
          }}
          isLoading={changePasswordMutation.isLoading}
        />
      )}

      {isBulkImportOpen && (
        <BulkUserImport
          onClose={() => setIsBulkImportOpen(false)}
        />
      )}
    </div>
  )
}

export default Users