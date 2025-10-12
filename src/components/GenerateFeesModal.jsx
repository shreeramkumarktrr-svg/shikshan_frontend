import React, { useState } from 'react';
import api from '../utils/api';

const GenerateFeesModal = ({ classes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    classId: '',
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Valid month is required';
    }

    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Valid year is required';
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
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      const response = await api.post('/fees/generate', submitData);
      
      // Show success message with student count
      alert(`Fee generated successfully for ${response.data.studentsCount} students!`);
      onSave();
    } catch (error) {
      console.error('Error generating fee:', error);
      setErrors({ submit: error.response?.data?.message || 'Error generating fee' });
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

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    yearOptions.push(year);
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Generate Monthly Fees
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will create fees for all active students in the selected class for the specified month.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
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
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Optional description (auto-generated if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount per Student (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
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
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.classId ? 'border-red-500' : 'border-gray-300'
                }`}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.month ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.month && (
                  <p className="text-red-500 text-sm mt-1">{errors.month}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The due date will be automatically set to the last day of the selected month 
                ({formData.month && formData.year ? new Date(formData.year, formData.month, 0).toLocaleDateString() : 'N/A'}).
              </p>
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Fees'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateFeesModal;