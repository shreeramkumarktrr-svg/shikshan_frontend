import { useState } from 'react';
import { homeworkAPI } from '../utils/api';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const HomeworkSubmissionModal = ({ homework, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    submissionText: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate submission format requirements
    if (homework.submissionFormat === 'text' && !formData.submissionText.trim()) {
      setError('Text submission is required for this homework');
      setLoading(false);
      return;
    }

    if (homework.submissionFormat === 'file' && formData.attachments.length === 0) {
      setError('File submission is required for this homework');
      setLoading(false);
      return;
    }

    if (homework.submissionFormat === 'both' && !formData.submissionText.trim() && formData.attachments.length === 0) {
      setError('Either text or file submission is required');
      setLoading(false);
      return;
    }

    try {
      await homeworkAPI.submit(homework.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit homework');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file), // In real app, upload to server first
      type: file.type,
      size: file.size
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const isOverdue = new Date() > new Date(homework.dueDate);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-[95%] sm:w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Submit Homework</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Homework Info */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{homework.title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-sm text-gray-600">
            <p><span className="font-medium">Subject:</span> {homework.subject}</p>
            <p><span className="font-medium">Due Date:</span> {new Date(homework.dueDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Max Marks:</span> {homework.maxMarks}</p>
            <p><span className="font-medium">Submission Format:</span> {homework.submissionFormat}</p>
          </div>
          {isOverdue && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
              <strong>Note:</strong> This homework is overdue. {homework.allowLateSubmission ? 'Late submissions are allowed.' : 'Late submissions may not be accepted.'}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Text Submission */}
          {(homework.submissionFormat === 'text' || homework.submissionFormat === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Answer {homework.submissionFormat === 'text' && '*'}
              </label>
              <textarea
                value={formData.submissionText}
                onChange={(e) => setFormData({ ...formData, submissionText: e.target.value })}
                rows="4"
                placeholder="Write your answer here..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={homework.submissionFormat === 'text'}
              />
            </div>
          )}

          {/* File Upload */}
          {(homework.submissionFormat === 'file' || homework.submissionFormat === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments {homework.submissionFormat === 'file' && '*'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <DocumentArrowUpIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <div className="mt-2 sm:mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload files
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {formData.attachments.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h5>
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {homework.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Instructions</h5>
              <p className="text-sm text-blue-800">{homework.instructions}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? 'Submitting...' : 'Submit Homework'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeworkSubmissionModal;