import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const UpdateFeePaymentsModal = ({ fee, onClose, onSave }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkUpdate, setBulkUpdate] = useState({
    status: '',
    paidAmount: '',
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });
  const [individualUpdates, setIndividualUpdates] = useState({});

  useEffect(() => {
    if (fee?.studentFees) {
      setStudents(fee.studentFees);
      // Initialize individual updates with current values
      const updates = {};
      fee.studentFees.forEach(sf => {
        updates[sf.id] = {
          status: sf.status,
          paidAmount: sf.paidAmount || 0,
          paidDate: sf.paidDate ? new Date(sf.paidDate).toISOString().split('T')[0] : '',
          paymentMethod: sf.paymentMethod || 'cash'
        };
      });
      setIndividualUpdates(updates);
    }
  }, [fee]);

  const handleStudentSelect = (studentFeeId) => {
    setSelectedStudents(prev => 
      prev.includes(studentFeeId) 
        ? prev.filter(id => id !== studentFeeId)
        : [...prev, studentFeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(sf => sf.id));
    }
  };

  const handleIndividualUpdate = (studentFeeId, field, value) => {
    setIndividualUpdates(prev => ({
      ...prev,
      [studentFeeId]: {
        ...prev[studentFeeId],
        [field]: value
      }
    }));
  };

  const handleBulkApply = () => {
    const updates = { ...individualUpdates };
    selectedStudents.forEach(studentFeeId => {
      if (bulkUpdate.status) updates[studentFeeId].status = bulkUpdate.status;
      if (bulkUpdate.paidAmount) updates[studentFeeId].paidAmount = parseFloat(bulkUpdate.paidAmount);
      if (bulkUpdate.paidDate) updates[studentFeeId].paidDate = bulkUpdate.paidDate;
      if (bulkUpdate.paymentMethod) updates[studentFeeId].paymentMethod = bulkUpdate.paymentMethod;
    });
    setIndividualUpdates(updates);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(individualUpdates).map(([studentFeeId, update]) => ({
        studentFeeId: parseInt(studentFeeId),
        ...update,
        paidAmount: parseFloat(update.paidAmount) || 0
      }));

      await api.put(`/fees/${fee.id}/payments/bulk`, { updates });
      onSave();
    } catch (error) {
      console.error('Error updating payments:', error);
      alert('Error updating payments. Please try again.');
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

  if (!fee) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Update Fee Payments</h3>
            <p className="text-gray-600">{fee.title} - {fee.class?.name} {fee.class?.section}</p>
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

        {/* Bulk Update Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Bulk Update Selected Students</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={bulkUpdate.status}
                onChange={(e) => setBulkUpdate(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input
                type="number"
                step="0.01"
                value={bulkUpdate.paidAmount}
                onChange={(e) => setBulkUpdate(prev => ({ ...prev, paidAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={bulkUpdate.paidDate}
                onChange={(e) => setBulkUpdate(prev => ({ ...prev, paidDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={bulkUpdate.paymentMethod}
                onChange={(e) => setBulkUpdate(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
                <option value="dd">DD</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleBulkApply}
            disabled={selectedStudents.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply to Selected ({selectedStudents.length})
          </button>
        </div>

        {/* Students List */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Student Payment Updates</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedStudents.length === students.length && students.length > 0}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Select All
            </label>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((studentFee) => {
                  const update = individualUpdates[studentFee.id] || {};
                  const isSelected = selectedStudents.includes(studentFee.id);
                  
                  return (
                    <tr key={studentFee.id} className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStudentSelect(studentFee.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {studentFee.student?.firstName} {studentFee.student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {studentFee.student?.rollNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(studentFee.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(studentFee.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={update.status || ''}
                          onChange={(e) => handleIndividualUpdate(studentFee.id, 'status', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={update.paidAmount || ''}
                          onChange={(e) => handleIndividualUpdate(studentFee.id, 'paidAmount', e.target.value)}
                          className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="date"
                          value={update.paidDate || ''}
                          onChange={(e) => handleIndividualUpdate(studentFee.id, 'paidDate', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateFeePaymentsModal;