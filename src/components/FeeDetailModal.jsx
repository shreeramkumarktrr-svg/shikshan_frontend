import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import UpdateFeePaymentsModal from './UpdateFeePaymentsModal';
import StudentFeeUpdateModal from './StudentFeeUpdateModal';

const FeeDetailModal = ({ fee: initialFee, onClose, onPayment, canManage, onRefresh }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showStudentUpdateModal, setShowStudentUpdateModal] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [fee, setFee] = useState(initialFee);
  const [loading, setLoading] = useState(false);

  // Function to refresh fee data
  const refreshFeeData = async () => {
    if (!initialFee?.id) {
      console.log('⚠️ No fee ID available for refresh, calling parent refresh instead');
      if (onRefresh) onRefresh();
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Refreshing fee data for ID:', initialFee.id);
      
      const response = await api.get(`/fees/${initialFee.id}`);
      console.log('✅ Refreshed fee data:', response.data);
      
      setFee(response.data);
    } catch (error) {
      console.error('❌ Error refreshing fee data:', error);
      // If refresh fails, call parent refresh as fallback
      if (onRefresh) onRefresh();
    } finally {
      setLoading(false);
    }
  };

  // Refresh fee data when modal opens
  useEffect(() => {
    setFee(initialFee);
    if (initialFee?.id) {
      refreshFeeData();
    }
  }, [initialFee]);
  if (!fee) return null;

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

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  const studentFees = fee.studentFees || [];
  const totalStudents = studentFees.length;
  const paidStudents = studentFees.filter(sf => sf.status === 'paid').length;
  const partialStudents = studentFees.filter(sf => sf.status === 'partial').length;
  const pendingStudents = studentFees.filter(sf => sf.status === 'pending').length;
  const overdueStudents = studentFees.filter(sf => isOverdue(fee.dueDate, sf.status)).length;

  const totalAmount = studentFees.reduce((sum, sf) => sum + parseFloat(sf.amount || sf.fee?.amount || 0), 0);
  const collectedAmount = studentFees.reduce((sum, sf) => sum + parseFloat(sf.paidAmount || 0), 0);
  const pendingAmount = totalAmount - collectedAmount;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-2 sm:top-10 mx-auto p-2 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[98vh] sm:max-h-none overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{fee.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">{fee.class?.name} - {fee.class?.section}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 self-end sm:self-auto"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fee Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Fee Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Amount:</span> ₹{fee.amount}</div>
              <div><span className="font-medium">Due Date:</span> {new Date(fee.dueDate).toLocaleDateString()}</div>
              <div><span className="font-medium">Status:</span> {getStatusBadge(fee.status)}</div>
              <div><span className="font-medium">Created by:</span> {fee.creator?.firstName} {fee.creator?.lastName}</div>
              {fee.description && (
                <div><span className="font-medium">Description:</span> <span className="break-words">{fee.description}</span></div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Collection Summary</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Total Amount:</span> ₹{totalAmount.toFixed(2)}</div>
              <div><span className="font-medium text-green-600">Collected:</span> ₹{collectedAmount.toFixed(2)}</div>
              <div><span className="font-medium text-yellow-600">Pending:</span> ₹{pendingAmount.toFixed(2)}</div>
              <div><span className="font-medium">Collection Rate:</span> {totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
        </div>

        {/* Student Status Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{paidStudents}</div>
            <div className="text-xs sm:text-sm text-green-800">Paid</div>
          </div>
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{partialStudents}</div>
            <div className="text-xs sm:text-sm text-blue-800">Partial</div>
          </div>
          <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingStudents}</div>
            <div className="text-xs sm:text-sm text-yellow-800">Pending</div>
          </div>
          <div className="bg-red-50 p-2 sm:p-3 rounded-lg text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{overdueStudents}</div>
            <div className="text-xs sm:text-sm text-red-800">Overdue</div>
          </div>
        </div>

        {/* Student Fees List */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-3 sm:px-4 py-3 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <h4 className="font-semibold text-gray-900">Student Payment Status</h4>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="text-sm text-blue-600">Refreshing...</div>
              )}
              <button
                onClick={refreshFeeData}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                title="Refresh data"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="sm:hidden max-h-96 overflow-y-auto">
            {studentFees.map((studentFee) => {
              const balance = parseFloat(studentFee.amount || studentFee.fee?.amount || 0) - parseFloat(studentFee.paidAmount || 0);
              const isStudentOverdue = isOverdue(fee.dueDate, studentFee.status);
              
              return (
                <div key={studentFee.id} className={`border-b border-gray-200 p-3 ${isStudentOverdue ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {studentFee.student?.user?.firstName || studentFee.student?.firstName} {studentFee.student?.user?.lastName || studentFee.student?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Roll: {studentFee.student?.rollNumber}
                        </div>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(isStudentOverdue && studentFee.status !== 'paid' ? 'overdue' : studentFee.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">₹{parseFloat(studentFee.amount || studentFee.fee?.amount || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid:</span>
                        <div className="font-medium text-green-600">₹{parseFloat(studentFee.paidAmount || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Balance:</span>
                        <div className="font-medium">₹{balance.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    {canManage && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedStudentFee(studentFee);
                            setShowStudentUpdateModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                        >
                          Update
                        </button>
                        {studentFee.status !== 'paid' && (
                          <button
                            onClick={() => onPayment(studentFee)}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                          >
                            Quick Pay
                          </button>
                        )}
                      </div>
                    )}
                    
                    {studentFee.paidDate && (
                      <div className="text-xs text-gray-500">
                        Paid: {new Date(studentFee.paidDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {canManage && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentFees.map((studentFee) => {
                  const balance = parseFloat(studentFee.amount || studentFee.fee?.amount || 0) - parseFloat(studentFee.paidAmount || 0);
                  const isStudentOverdue = isOverdue(fee.dueDate, studentFee.status);
                  
                  return (
                    <tr key={studentFee.id} className={isStudentOverdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {studentFee.student?.user?.firstName || studentFee.student?.firstName} {studentFee.student?.user?.lastName || studentFee.student?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {studentFee.student?.rollNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(studentFee.amount || studentFee.fee?.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                        ₹{parseFloat(studentFee.paidAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(isStudentOverdue && studentFee.status !== 'paid' ? 'overdue' : studentFee.status)}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setSelectedStudentFee(studentFee);
                                setShowStudentUpdateModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Update
                            </button>
                            {studentFee.status !== 'paid' && (
                              <button
                                onClick={() => onPayment(studentFee)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Quick Pay
                              </button>
                            )}
                          </div>
                          {studentFee.paidDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid: {new Date(studentFee.paidDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 space-y-2 sm:space-y-0">
          <div>
            {canManage && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 w-full sm:w-auto"
              >
                Update Payments
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 w-full sm:w-auto"
          >
            Close
          </button>
        </div>

        {/* Update Payments Modal */}
        {showUpdateModal && (
          <UpdateFeePaymentsModal
            fee={fee}
            onClose={() => setShowUpdateModal(false)}
            onSave={() => {
              setShowUpdateModal(false);
              // Refresh the fee data in the modal
              refreshFeeData();
              // Also refresh the parent component
              if (onRefresh) onRefresh();
            }}
          />
        )}

        {/* Individual Student Update Modal */}
        {showStudentUpdateModal && selectedStudentFee && (
          <StudentFeeUpdateModal
            studentFee={selectedStudentFee}
            onClose={() => {
              setShowStudentUpdateModal(false);
              setSelectedStudentFee(null);
            }}
            onSave={() => {
              setShowStudentUpdateModal(false);
              setSelectedStudentFee(null);
              
              // For student views (synthetic fee objects), close modal and refresh parent
              if (!initialFee?.studentFees || initialFee.studentFees.length === 1) {
                console.log('🔄 Student view detected, closing modal and refreshing parent');
                onClose();
                if (onRefresh) onRefresh();
              } else {
                // For admin views, refresh the fee data in the modal
                refreshFeeData();
                if (onRefresh) onRefresh();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FeeDetailModal;