import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { homeworkAPI } from '../utils/api';
import { XMarkIcon, DocumentArrowDownIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const HomeworkDetailModal = ({ homework, onClose }) => {
  const { user } = useAuth();
  const [detailedHomework, setDetailedHomework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    marksObtained: '',
    feedback: ''
  });

  const canGrade = ['super_admin', 'school_admin', 'principal', 'teacher'].includes(user?.role);

  useEffect(() => {
    if (homework) {
      fetchHomeworkDetails();
    }
  }, [homework]);

  const fetchHomeworkDetails = async () => {
    try {
      setLoading(true);
      const response = await homeworkAPI.getById(homework.id);
      setDetailedHomework(response.data.homework);
    } catch (err) {
      console.error('Failed to fetch homework details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submission) => {
    setGradingSubmission(submission);
    setGradeForm({
      marksObtained: submission.marksObtained || '',
      feedback: submission.feedback || ''
    });
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    try {
      await homeworkAPI.grade(homework.id, gradingSubmission.id, gradeForm);
      setGradingSubmission(null);
      fetchHomeworkDetails();
    } catch (err) {
      console.error('Failed to grade submission:', err);
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

  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'graded': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!detailedHomework) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-2 sm:top-10 mx-auto p-3 sm:p-5 border w-[95%] sm:w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Homework Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Homework Information */}
        <div className="bg-gray-50 p-3 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{detailedHomework.title}</h4>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subject:</span> {detailedHomework.subject}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Class:</span> {detailedHomework.class?.name} ({detailedHomework.class?.grade}-{detailedHomework.class?.section})
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Teacher:</span> {detailedHomework.teacher?.firstName} {detailedHomework.teacher?.lastName}
                </p>
              </div>
            </div>
            <div>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Due Date:</span> {new Date(detailedHomework.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Max Marks:</span> {detailedHomework.maxMarks}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {detailedHomework.type}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Priority:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(detailedHomework.priority)}`}>
                    {detailedHomework.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {detailedHomework.description && (
            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700">{detailedHomework.description}</p>
            </div>
          )}

          {detailedHomework.instructions && (
            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-2">Instructions</h5>
              <p className="text-sm text-gray-700">{detailedHomework.instructions}</p>
            </div>
          )}

          {detailedHomework.attachments && detailedHomework.attachments.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium text-gray-900 mb-2">Attachments</h5>
              <div className="space-y-2">
                {detailedHomework.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {attachment.name}
                    </a>
                    <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submissions */}
        {canGrade && detailedHomework.submissions && detailedHomework.submissions.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Submissions ({detailedHomework.submissions.length})</h4>
            <div className="space-y-3 sm:space-y-4">
              {detailedHomework.submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {submission.student?.user?.firstName} {submission.student?.user?.lastName}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        {submission.isLate && <span className="text-red-600 ml-2">(Late)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                      {submission.status === 'submitted' && (
                        <button
                          onClick={() => handleGradeSubmission(submission)}
                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                        >
                          Grade
                        </button>
                      )}
                    </div>
                  </div>

                  {submission.submissionText && (
                    <div className="mb-3">
                      <h6 className="font-medium text-gray-700 mb-1">Submission Text</h6>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.submissionText}</p>
                    </div>
                  )}

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mb-3">
                      <h6 className="font-medium text-gray-700 mb-1">Attachments</h6>
                      <div className="space-y-1">
                        {submission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {attachment.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.status === 'graded' && (
                    <div className="bg-green-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AcademicCapIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Grade: {submission.marksObtained}/{detailedHomework.maxMarks}
                        </span>
                      </div>
                      {submission.feedback && (
                        <p className="text-sm text-green-700">{submission.feedback}</p>
                      )}
                      <p className="text-xs text-green-600 mt-1">
                        Graded by {submission.grader?.firstName} {submission.grader?.lastName} on {new Date(submission.gradedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student's own submission */}
        {user.role === 'student' && detailedHomework.submissions && detailedHomework.submissions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h4>
            {detailedHomework.submissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      {submission.isLate && <span className="text-red-600 ml-2">(Late)</span>}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                {submission.submissionText && (
                  <div className="mb-3">
                    <h6 className="font-medium text-gray-700 mb-1">Your Answer</h6>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.submissionText}</p>
                  </div>
                )}

                {submission.status === 'graded' && (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AcademicCapIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Grade: {submission.marksObtained}/{detailedHomework.maxMarks}
                      </span>
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-green-700">{submission.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div className="relative top-10 sm:top-20 mx-auto p-3 sm:p-5 border w-[90%] sm:w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Grade Submission</h3>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={submitGrade} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks Obtained (out of {detailedHomework.maxMarks})
                  </label>
                  <input
                    type="number"
                    value={gradeForm.marksObtained}
                    onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: e.target.value })}
                    min="0"
                    max={detailedHomework.maxMarks}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                  >
                    Submit Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkDetailModal;