import React, { useState } from 'react';
import api from '../utils/api';

const PaymentModal = ({ studentFee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    paidAmount: '',
    paymentMethod: 'cash',
    transactionId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!studentFee) return null;

  const remainingBalance = parseFloat(studentFee.amount) - parseFloat(studentFee.paidAmount);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.paidAmount || parseFloat(formData.paidAmount) <= 0) {
      newErrors.paidAmount = 'Valid payment amount is required';
    } else if (parseFloat(formData.paidAmount) > remainingBalance) {
      newErrors.paidAmount = 'Payment amount cannot exceed remaining balance';
    }

    if (formData.paymentMethod === 'online' && !formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required for online payments';
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
        paidAmount: parseFloat(formData.paidAmount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        notes: formData.notes || null
      };

      await api.post(`/fees/payment/${studentFee.id}`, submitData);
      onSave();
    } catch (error) {
      console.error('Error recording payment:', error);
      setErrors({ submit: error.response?.data?.message || 'Error recording payment' });
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

  const handleFullPayment = () => {
    setFormData(prev => ({
      ...prev,
      paidAmount: remainingBalance.toFixed(2)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Record Payment
          </h3>
          
          {/* Student and Fee Info */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {studentFee.student.firstName} {studentFee.student.lastName}
              </div>
              <div className="text-gray-600">
                Roll: {studentFee.student.rollNumber}
              </div>
              <div className="text-gray-600">
                Fee: {studentFee.fee.title}
              </div>
              <div className="mt-2 space-y-1">
                <div>Total Amount: ₹{parseFloat(studentFee.amount).toFixed(2)}</div>
                <div>Already Paid: ₹{parseFloat(studentFee.paidAmount).toFixed(2)}</div>
                <div className="font-medium text-red-600">
                  Remaining Balance: ₹{remainingBalance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₹) *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  max={remainingBalance}
                  step="0.01"
                  className={`flex-1 border rounded-md px-3 py-2 ${
                    errors.paidAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={handleFullPayment}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Full
                </button>
              </div>
              {errors.paidAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.paidAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="online">Online Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {(formData.paymentMethod === 'online' || formData.paymentMethod === 'upi' || formData.paymentMethod === 'cheque') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID / Cheque Number {formData.paymentMethod === 'online' ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.transactionId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter transaction ID or cheque number"
                />
                {errors.transactionId && (
                  <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Optional notes about the payment"
              />
            </div>

            {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;