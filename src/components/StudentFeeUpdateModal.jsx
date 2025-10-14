import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const StudentFeeUpdateModal = ({ studentFee, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    paidAmount: '',
    paidDate: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    if (studentFee) {
      console.log('📋 StudentFee data received:', studentFee);
      console.log('📋 Fee ID from studentFee:', studentFee.feeId || studentFee.fee?.id);
      
      setFormData({
        status: studentFee.status || 'pending',
        paidAmount: studentFee.paidAmount || '',
        paidDate: studentFee.paidDate ? new Date(studentFee.paidDate).toISOString().split('T')[0] : '',
        paymentMethod: studentFee.paymentMethod || 'cash'
      });
    }
  }, [studentFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = [{
        studentFeeId: studentFee.id,
        status: formData.status,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        paidDate: formData.paidDate || null,
        paymentMethod: formData.paymentMethod
      }];

      console.log('🔄 Submitting payment update:', updates);
      console.log('🔄 Fee ID:', studentFee.feeId || studentFee.fee?.id);
      
      const response = await api.put(`/fees/${studentFee.feeId || studentFee.fee?.id}/payments/bulk`, { updates });
      console.log('✅ Payment update response:', response.data);
      
      // Check if the update was successful
      if (response.data.success && response.data.summary.successful > 0) {
        alert('Payment updated successfully!');
        onSave();
      } else {
        console.error('❌ Update failed:', response.data);
        alert('Payment update failed. Please check the console for details.');
      }
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      console.error('❌ Error response:', error.response?.data);
      alert(`Error updating payment: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
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

  if (!studentFee) return null;

  const feeAmount = parseFloat(studentFee.fee?.amount || studentFee.amount || 0);
  const currentPaid = parseFloat(studentFee.paidAmount || 0);
  const newPaidAmount = parseFloat(formData.paidAmount || 0);
  const balance = feeAmount - newPaidAmount;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Update Payment</h3>
            <p className="text-sm text-gray-600">
              {studentFee.student?.user?.firstName} {studentFee.student?.user?.lastName}
            </p>
            <p className="text-xs text-gray-500">
              Roll: {studentFee.student?.rollNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fee Information */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Fee:</span> {studentFee.fee?.title}</div>
            <div><span className="font-medium">Amount:</span> ₹{feeAmount.toFixed(2)}</div>
            <div><span className="font-medium">Current Status:</span> {getStatusBadge(studentFee.status)}</div>
            <div><span className="font-medium">Currently Paid:</span> ₹{currentPaid.toFixed(2)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={feeAmount}
              value={formData.paidAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {newPaidAmount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Balance: ₹{balance.toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paidDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="cheque">Cheque</option>
              <option value="dd">DD</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFeeUpdateModal;