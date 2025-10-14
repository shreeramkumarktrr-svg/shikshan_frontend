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
  if (featureLoading) return <LoadingSpinner />;
  
  if (!hasAccess) {
    return (
      <FeatureAccessDenied 
        feature={FEATURES.FEES}
        onUpgrade={() => window.location.href = '/app/subscription/upgrade'}
      />
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={isStudent ? "My Fees" : "Fees Management"}
        subtitle={isStudent ? "View your fee details and payment status" : "Manage school fees and track payments"}
        actions={isStudent ? [] : [
          ...(canGenerateFees ? [{
            label: 'Generate Fees',
            variant: 'secondary',
            icon: <CurrencyDollarIcon className="h-5 w-5" />,
            onClick: handleGenerateFees
          }] : []),
          ...(canManageFees ? [{
            label: 'Create Fee',
            variant: 'primary',
            icon: <PlusIcon className="h-5 w-5" />,
            onClick: handleCreateFee,
            primary: true
          }] : [])
        ]}
      />

      {/* Statistics Cards */}
      {!isStudent && (
        <CardGrid columns="auto">
          <StatCard
            title="Total Fees"
            value={`₹${stats.totalFees}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Collected"
            value={`₹${stats.totalCollected}`}
            icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Pending"
            value={`₹${stats.totalPending}`}
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
          />
          <StatCard
            title="Overdue"
            value={`₹${stats.totalOverdue}`}
            icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
          />
          <StatCard
            title="Collection Rate"
            value={`${stats.collectionRate}%`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-600" />}
          />
        </CardGrid>
      )}
      
      {/* Student Fee Summary */}
      {isStudent && (
        <CardGrid columns="auto">
          <StatCard
            title="Total Fees"
            value={`₹${stats.totalFees || 0}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Paid"
            value={`₹${stats.totalPaid || 0}`}
            icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Pending"
            value={`₹${stats.totalPending || 0}`}
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
          />
          <StatCard
            title="Overdue"
            value={`₹${stats.totalOverdue || 0}`}
            icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
          />
        </CardGrid>
      )}

      {/* Filters - Only for admin/teachers */}
      {!isStudent && (
        <ResponsiveCard title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <FormSelect
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
            >
              <option value="">All Classes</option>
              {Array.isArray(classes) && classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <FormSelect
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FormSelect>
          </div>
        </div>
      </ResponsiveCard>
      )}

      {/* Fees List */}
      <ResponsiveTable
        columns={isStudent ? studentColumns : adminColumns}
        data={fees}
        loading={loading}
        emptyMessage="No fees found. Create your first fee to get started."
      />

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