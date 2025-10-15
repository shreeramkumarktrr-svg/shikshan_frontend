import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const FeeModal = ({ fee, classes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    classId: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (fee) {
      setFormData({
        title: fee.title || '',
        description: fee.description || '',
        amount: fee.amount || '',
        dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
        classId: fee.classId || '',
        status: fee.status || 'active'
      });
    }
  }, [fee]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (fee) {
        await api.put(`/fees/${fee.id}`, submitData);
      } else {
        await api.post('/fees', submitData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving fee:', error);
      setErrors({ submit: error.response?.data?.message || 'Error saving fee' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-2 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white max-h-[95vh] sm:max-h-none overflow-y-auto">
        <div className="mt-1 sm:mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {fee ? 'Edit Fee' : 'Create New Fee'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g., Monthly Tuition Fee"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input ${errors.amount ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`input ${errors.dueDate ? 'input-error' : ''}`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className={`input ${errors.classId ? 'input-error' : ''}`}
                disabled={!!fee} // Disable class change when editing
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
              )}
              {fee && (
                <p className="text-sm text-gray-500 mt-1">
                  Class cannot be changed when editing a fee
                </p>
              )}
            </div>

            {fee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline w-full sm:w-auto order-2 sm:order-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : (fee ? 'Update Fee' : 'Create Fee')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeeModal;