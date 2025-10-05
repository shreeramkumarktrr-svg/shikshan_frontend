import React from 'react';

const FeeDetailModal = ({ fee, onClose, onPayment, canManage }) => {
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

  const totalStudents = fee.studentFees.length;
  const paidStudents = fee.studentFees.filter(sf => sf.status === 'paid').length;
  const partialStudents = fee.studentFees.filter(sf => sf.status === 'partial').length;
  const pendingStudents = fee.studentFees.filter(sf => sf.status === 'pending').length;
  const overdueStudents = fee.studentFees.filter(sf => isOverdue(fee.dueDate, sf.status)).length;

  const totalAmount = fee.studentFees.reduce((sum, sf) => sum + parseFloat(sf.amount), 0);
  const collectedAmount = fee.studentFees.reduce((sum, sf) => sum + parseFloat(sf.paidAmount), 0);
  const pendingAmount = totalAmount - collectedAmount;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{fee.title}</h3>
            <p className="text-gray-600">{fee.class.name} - {fee.class.section}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Fee Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Amount:</span> ₹{fee.amount}</div>
              <div><span className="font-medium">Due Date:</span> {new Date(fee.dueDate).toLocaleDateString()}</div>
              <div><span className="font-medium">Status:</span> {getStatusBadge(fee.status)}</div>
              <div><span className="font-medium">Created by:</span> {fee.creator.firstName} {fee.creator.lastName}</div>
              {fee.description && (
                <div><span className="font-medium">Description:</span> {fee.description}</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{paidStudents}</div>
            <div className="text-sm text-green-800">Paid</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{partialStudents}</div>
            <div className="text-sm text-blue-800">Partial</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingStudents}</div>
            <div className="text-sm text-yellow-800">Pending</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{overdueStudents}</div>
            <div className="text-sm text-red-800">Overdue</div>
          </div>
        </div>

        {/* Student Fees List */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h4 className="font-semibold text-gray-900">Student Payment Status</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
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
                {fee.studentFees.map((studentFee) => {
                  const balance = parseFloat(studentFee.amount) - parseFloat(studentFee.paidAmount);
                  const isStudentOverdue = isOverdue(fee.dueDate, studentFee.status);
                  
                  return (
                    <tr key={studentFee.id} className={isStudentOverdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {studentFee.student.firstName} {studentFee.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {studentFee.student.rollNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(studentFee.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                        ₹{parseFloat(studentFee.paidAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ₹{balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(isStudentOverdue && studentFee.status !== 'paid' ? 'overdue' : studentFee.status)}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          {studentFee.status !== 'paid' && (
                            <button
                              onClick={() => onPayment(studentFee)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Record Payment
                            </button>
                          )}
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

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeDetailModal;