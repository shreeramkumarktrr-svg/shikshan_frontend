import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api, { feesAPI } from '../utils/api';
import { useFeatureAccess, FeatureAccessDenied } from '../components/FeatureGuard';
import { FEATURES } from '../utils/featureAccess';
import FeeModal from '../components/FeeModal';
import FeeDetailModal from '../components/FeeDetailModal';
import PaymentModal from '../components/PaymentModal';
import GenerateFeesModal from '../components/GenerateFeesModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ResponsiveCard, { CardGrid, StatCard } from '../components/ResponsiveCard';
import ResponsiveTable from '../components/ResponsiveTable';
import PageHeader from '../components/PageHeader';
import { FormSelect } from '../components/ResponsiveForm';
import { PlusIcon, CurrencyDollarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Fees = () => {
  const { user } = useAuth();
  const { hasAccess, loading: featureLoading } = useFeatureAccess(FEATURES.FEES);
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateFeesModal, setShowGenerateFeesModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [filters, setFilters] = useState({
    classId: '',
    status: ''
  });
  const [stats, setStats] = useState({
    totalFees: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0
  });

  useEffect(() => {
    fetchFees();
    fetchStats();
    if (user?.role !== 'student') {
      fetchClasses();
    }
  }, [filters, user?.role]);

  const fetchFees = async () => {
    // Don't fetch fees if user is not loaded yet
    if (!user || !user.role) {
      console.log('⏳ User not loaded yet, skipping fees fetch');
      return;
    }
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // For students, fetch their own fees
      if (user.role === 'student') {
        try {
          console.log('📋 Fetching student fees via /my-fees');
          const response = await feesAPI.getMyFees();
          setFees(response.data.studentFees || []);
        } catch (error) {
          console.error('Error fetching student fees:', error);
          setFees([]);
        }
        setLoading(false);
        return;
      }
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/fees?${params}`);
      // Handle both old and new response structures
      const feesData = response.data?.fees || response.data || [];
      setFees(Array.isArray(feesData) ? feesData : []);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setFees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      // Ensure we have an array, even if the API returns different structure
      const classesData = response.data?.classes || response.data || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]); // Set empty array on error
    }
  };

  const fetchStats = async () => {
    // Don't fetch stats if user is not loaded yet
    if (!user || !user.role) {
      console.log('⏳ User not loaded yet, skipping stats fetch');
      return;
    }
    
    try {
      console.log('🔍 fetchStats called for user role:', user.role);
      
      if (user.role === 'student') {
        console.log('📊 Fetching student stats via /my-stats');
        // Students get their own stats
        const response = await feesAPI.getMyStats();
        setStats(response.data);
      } else {
        console.log('📊 Fetching general stats via /stats/overview for role:', user.role);
        // Admin/teachers get general stats
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        
        console.log('📊 Stats URL:', `/fees/stats/overview?${params}`);
        const response = await api.get(`/fees/stats/overview?${params}`);
        console.log('📊 Stats response:', response.data);
        setStats(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('User role was:', user?.role);
      // Set default stats to prevent UI errors
      setStats({
        totalFees: 0,
        totalCollected: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        collectionRate: 0
      });
    }
  };

  const handleCreateFee = () => {
    setSelectedFee(null);
    setShowFeeModal(true);
  };

  const handleGenerateFees = () => {
    setShowGenerateFeesModal(true);
  };

  const handleEditFee = (fee) => {
    setSelectedFee(fee);
    setShowFeeModal(true);
  };

  const handleViewFee = (fee) => {
    setSelectedFee(fee);
    setShowDetailModal(true);
  };

  const handlePayment = (studentFee) => {
    setSelectedStudentFee(studentFee);
    setShowPaymentModal(true);
  };

  const handleDeleteFee = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await api.delete(`/fees/${feeId}`);
        fetchFees();
        fetchStats();
      } catch (error) {
        console.error('Error deleting fee:', error);
        alert('Error deleting fee');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const canManageFees = ['school_admin', 'principal'].includes(user?.role);
  const canGenerateFees = ['school_admin', 'principal'].includes(user?.role);
  const isStudent = user?.role === 'student';

  // Student-specific columns for their fee view
  const studentColumns = [
    {
      key: 'fee',
      label: 'Fee Details',
      render: (_, studentFee) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{studentFee.fee?.title}</div>
          {studentFee.fee?.description && (
            <div className="text-sm text-gray-500 truncate">{studentFee.fee?.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (_, studentFee) => (
        <div className="text-sm font-medium text-gray-900">₹{studentFee.fee?.amount}</div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (_, studentFee) => (
        <div className="text-sm text-gray-900">
          {new Date(studentFee.fee?.dueDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Payment Status',
      render: (_, studentFee) => getStatusBadge(studentFee.status)
    },
    {
      key: 'paidAmount',
      label: 'Paid Amount',
      render: (_, studentFee) => (
        <div className="text-sm text-gray-900">
          ₹{studentFee.paidAmount || 0}
        </div>
      )
    },
    {
      key: 'paidDate',
      label: 'Paid Date',
      render: (_, studentFee) => (
        <div className="text-sm text-gray-900">
          {studentFee.paidDate ? new Date(studentFee.paidDate).toLocaleDateString() : '-'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, studentFee) => (
        <div className="flex flex-col gap-1">
          {/* Temporarily disabled Pay Now for students */}
          {false && studentFee.status !== 'paid' && (
            <button
              onClick={() => handlePayment(studentFee)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Pay Now
            </button>
          )}
          <button
            onClick={() => {
              // For students, we need to create a proper fee object from studentFee
              const feeId = studentFee.fee?.id || studentFee.feeId;
              const enhancedStudentFee = {
                ...studentFee,
                feeId: feeId // Ensure feeId is set for the update modal
              };
              
              const feeForModal = {
                id: feeId,
                title: studentFee.fee?.title,
                description: studentFee.fee?.description,
                amount: studentFee.fee?.amount,
                dueDate: studentFee.fee?.dueDate,
                status: studentFee.fee?.status || 'active',
                class: studentFee.fee?.class,
                creator: studentFee.fee?.creator || { firstName: 'System', lastName: 'Admin' },
                studentFees: [enhancedStudentFee] // Wrap the enhanced studentFee in an array
              };
              handleViewFee(feeForModal);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      )
    }
  ];

  // Admin/Teacher columns for fee management
  const adminColumns = [
    {
      key: 'title',
      label: 'Fee Details',
      render: (_, fee) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{fee.title}</div>
          {fee.description && (
            <div className="text-sm text-gray-500 truncate">{fee.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'class',
      label: 'Class',
      render: (_, fee) => (
        <div className="text-sm text-gray-900">
          {fee.class?.name} - {fee.class?.section}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">₹{value}</div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'collection',
      label: 'Collection',
      render: (_, fee) => {
        const totalStudents = fee.studentFees?.length || 0;
        const paidStudents = fee.studentFees?.filter(sf => sf.status === 'paid').length || 0;
        const collectionRate = totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(1) : 0;
        return (
          <div className="text-sm text-gray-900">
            {paidStudents}/{totalStudents} ({collectionRate}%)
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, fee) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleViewFee(fee)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
          {canManageFees && (
            <>
              <button
                onClick={() => handleEditFee(fee)}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Edit
              </button>
              {user?.role === 'school_admin' && (
                <button
                  onClick={() => handleDeleteFee(fee.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  // Check feature access first
  if (featureLoading) return <LoadingSpinner centered size="lg" />;
  
  if (!hasAccess) {
    return (
      <FeatureAccessDenied 
        feature={FEATURES.FEES}
        onUpgrade={() => window.location.href = '/app/subscription/upgrade'}
      />
    );
  }

  if (loading) return <LoadingSpinner centered size="lg" />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isStudent ? "My Fees" : "Fees Management"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isStudent ? "View your fee details and payment status" : "Manage school fees and track payments"}
          </p>
        </div>
        {!isStudent && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {canGenerateFees && (
              <button
                onClick={handleGenerateFees}
                className="btn-outline w-full sm:w-auto"
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Generate Fees
              </button>
            )}
            {canManageFees && (
              <button
                onClick={handleCreateFee}
                className="btn-primary w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Fee
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {!isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Fees</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalFees}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Collected</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalCollected}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalPending}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Overdue</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalOverdue}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card col-span-2 sm:col-span-1">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Collection Rate</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">{stats.collectionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Student Fee Summary */}
      {isStudent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Fees</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalFees || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Paid</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalPaid || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalPending || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Overdue</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">₹{stats.totalOverdue || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters - Only for admin/teachers */}
      {!isStudent && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={filters.classId}
                  onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">All Classes</option>
                  {Array.isArray(classes) && classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fees List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            {isStudent ? "My Fees" : "Fees"}
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner centered size="md" className="py-8" />
          ) : fees.length === 0 ? (
            <div className="p-8 text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No fees found. Create your first fee to get started.</p>
            </div>
          ) : (
            <>
              {/* Mobile Layout */}
              <div className="sm:hidden">
                {fees.map((fee) => (
                  <div key={fee.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {isStudent ? fee.fee?.title : fee.title}
                          </h4>
                          {(isStudent ? fee.fee?.description : fee.description) && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {isStudent ? fee.fee?.description : fee.description}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ml-2 flex-shrink-0 ${
                          isStudent ? getStatusBadge(fee.status).props.className : getStatusBadge(fee.status).props.className
                        }`}>
                          {isStudent ? fee.status : fee.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">
                            ₹{isStudent ? fee.fee?.amount : fee.amount}
                          </span>
                          {!isStudent && fee.class && (
                            <span>{fee.class.name} - {fee.class.section}</span>
                          )}
                        </div>
                        <span>
                          Due: {new Date(isStudent ? fee.fee?.dueDate : fee.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {isStudent && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-gray-500">
                            <span className="font-medium">Paid: ₹{fee.paidAmount || 0}</span>
                            {fee.paidDate && (
                              <span className="ml-2">on {new Date(fee.paidDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {!isStudent && fee.studentFees && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div>
                            Collection: {fee.studentFees.filter(sf => sf.status === 'paid').length}/{fee.studentFees.length}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {!isStudent && fee.creator && (
                            <span>Created by {fee.creator.firstName} {fee.creator.lastName}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              if (isStudent) {
                                const feeId = fee.fee?.id || fee.feeId;
                                const enhancedStudentFee = {
                                  ...fee,
                                  feeId: feeId
                                };
                                
                                const feeForModal = {
                                  id: feeId,
                                  title: fee.fee?.title,
                                  description: fee.fee?.description,
                                  amount: fee.fee?.amount,
                                  dueDate: fee.fee?.dueDate,
                                  status: fee.fee?.status || 'active',
                                  class: fee.fee?.class,
                                  creator: fee.fee?.creator || { firstName: 'System', lastName: 'Admin' },
                                  studentFees: [enhancedStudentFee]
                                };
                                handleViewFee(feeForModal);
                              } else {
                                handleViewFee(fee);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                          >
                            View Details
                          </button>
                          {!isStudent && canManageFees && (
                            <>
                              <button
                                onClick={() => handleEditFee(fee)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                              >
                                Edit
                              </button>
                              {user?.role === 'school_admin' && (
                                <button
                                  onClick={() => handleDeleteFee(fee.id)}
                                  className="text-red-600 hover:text-red-900 text-xs font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
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
                      {(isStudent ? studentColumns : adminColumns).map((column) => (
                        <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        {(isStudent ? studentColumns : adminColumns).map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            {column.render ? column.render(fee[column.key], fee) : fee[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFeeModal && (
        <FeeModal
          fee={selectedFee}
          classes={classes}
          onClose={() => setShowFeeModal(false)}
          onSave={() => {
            fetchFees();
            fetchStats();
            setShowFeeModal(false);
          }}
        />
      )}

      {showDetailModal && (
        <FeeDetailModal
          fee={selectedFee}
          onClose={() => setShowDetailModal(false)}
          onPayment={handlePayment}
          canManage={canManageFees}
          onRefresh={() => {
            fetchFees();
            fetchStats();
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          studentFee={selectedStudentFee}
          onClose={() => setShowPaymentModal(false)}
          onSave={() => {
            fetchFees();
            fetchStats();
            setShowPaymentModal(false);
            setShowDetailModal(false);
          }}
        />
      )}

      {showGenerateFeesModal && (
        <GenerateFeesModal
          classes={classes}
          onClose={() => setShowGenerateFeesModal(false)}
          onSave={() => {
            fetchFees();
            fetchStats();
            setShowGenerateFeesModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Fees;