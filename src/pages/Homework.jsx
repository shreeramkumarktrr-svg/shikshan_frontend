import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { homeworkAPI } from '../utils/api';
import { useFeatureAccess, FeatureAccessDenied } from '../components/FeatureGuard';
import { FEATURES, handleFeatureAccessError } from '../utils/featureAccess';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeworkModal from '../components/HomeworkModal';
import HomeworkDetailModal from '../components/HomeworkDetailModal';
import HomeworkSubmissionModal from '../components/HomeworkSubmissionModal';
import {
  PlusIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Homework = () => {
  const { user } = useAuth();
  const { hasAccess, loading: featureLoading } = useFeatureAccess(FEATURES.HOMEWORK);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    subject: '',
    status: ''
  });
  const [stats, setStats] = useState({});

  const canCreateHomework = ['super_admin', 'school_admin', 'principal', 'teacher'].includes(user?.role);

  useEffect(() => {
    fetchHomework();
    fetchStats();
  }, [filters]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const response = await homeworkAPI.getAll(params);
      setHomework(response.data.homework);
    } catch (err) {
      setError('Failed to fetch homework');
      console.error('Fetch homework error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await homeworkAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleCreateHomework = () => {
    setSelectedHomework(null);
    setShowModal(true);
  };

  const handleEditHomework = (hw) => {
    setSelectedHomework(hw);
    setShowModal(true);
  };

  const handleViewHomework = (hw) => {
    setSelectedHomework(hw);
    setShowDetailModal(true);
  };

  const handleSubmitHomework = (hw) => {
    setSelectedHomework(hw);
    setShowSubmissionModal(true);
  };

  const handleDeleteHomework = async (id) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await homeworkAPI.delete(id);
        fetchHomework();
      } catch (err) {
        setError('Failed to delete homework');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const hasSubmission = homework.submissions && homework.submissions.length > 0;
    
    if (hasSubmission) {
      const submission = homework.submissions[0];
      if (submission.status === 'graded') return 'text-green-600 bg-green-100';
      return 'text-blue-600 bg-blue-100';
    }
    
    if (dueDate < now) return 'text-red-600 bg-red-100';
    if (dueDate - now < 24 * 60 * 60 * 1000) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const hasSubmission = homework.submissions && homework.submissions.length > 0;
    
    if (hasSubmission) {
      const submission = homework.submissions[0];
      if (submission.status === 'graded') return `Graded (${submission.marksObtained}/${homework.maxMarks})`;
      return 'Submitted';
    }
    
    if (dueDate < now) return 'Overdue';
    if (dueDate - now < 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Pending';
  };

  // Check feature access first
  if (featureLoading) return <LoadingSpinner />;
  
  if (!hasAccess) {
    return (
      <FeatureAccessDenied 
        feature={FEATURES.HOMEWORK}
        onUpgrade={() => window.location.href = '/app/subscription/upgrade'}
      />
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-600">Manage assignments and track submissions</p>
        </div>
        {canCreateHomework && (
          <button
            onClick={handleCreateHomework}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Homework
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {canCreateHomework && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Homework</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHomework || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueHomework || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
            <option value="reading">Reading</option>
            <option value="practice">Practice</option>
            <option value="research">Research</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="text"
            placeholder="Filter by subject"
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Homework List */}
      <div className="bg-white shadow rounded-lg">
        {homework.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No homework found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canCreateHomework ? 'Get started by creating a new homework assignment.' : 'No homework has been assigned yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {homework.map((hw) => (
                  <tr key={hw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hw.title}</div>
                        <div className="text-sm text-gray-500">{hw.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hw.class?.name} ({hw.class?.grade}-{hw.class?.section})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(hw.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(hw.priority)}`}>
                        {hw.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hw)}`}>
                        {getStatusText(hw)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewHomework(hw)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {user.role === 'student' && !hw.submissions?.length && (
                          <button
                            onClick={() => handleSubmitHomework(hw)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Submit
                          </button>
                        )}
                        {canCreateHomework && hw.teacherId === user.id && (
                          <>
                            <button
                              onClick={() => handleEditHomework(hw)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteHomework(hw.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <HomeworkModal
          homework={selectedHomework}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchHomework();
          }}
        />
      )}

      {showDetailModal && (
        <HomeworkDetailModal
          homework={selectedHomework}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showSubmissionModal && (
        <HomeworkSubmissionModal
          homework={selectedHomework}
          onClose={() => setShowSubmissionModal(false)}
          onSuccess={() => {
            setShowSubmissionModal(false);
            fetchHomework();
          }}
        />
      )}
    </div>
  );
};

export default Homework;