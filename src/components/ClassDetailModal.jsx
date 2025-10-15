import { XMarkIcon, PencilIcon, TrashIcon, ClockIcon, UserGroupIcon, AcademicCapIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline'

function ClassDetailModal({ class: classData, onClose, onEdit, onManageTimetable, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Class Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{classData.name}</h3>
              <p className="text-sm sm:text-base text-gray-600">Grade {classData.grade} - Section {classData.section}</p>
              <span className={`badge mt-1 sm:mt-2 text-xs sm:text-sm ${
                classData.isActive ? 'badge-success' : 'badge-danger'
              }`}>
                {classData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">Students</div>
                    <div className="text-sm text-gray-500">
                      {classData.studentCount || 0} / {classData.maxStudents}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">Room</div>
                    <div className="text-sm text-gray-500 truncate">
                      {classData.room || 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">Class Teacher</div>
                    <div className="text-sm text-gray-500 truncate">
                      {classData.classTeacher 
                        ? `${classData.classTeacher.firstName} ${classData.classTeacher.lastName}`
                        : 'Not assigned'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">Created</div>
                    <div className="text-sm text-gray-500">
                      {new Date(classData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          {classData.subjects && classData.subjects.length > 0 && (
            <div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Subjects</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {classData.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="badge badge-primary text-xs sm:text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timetable Preview */}
          {classData.timetable && Object.keys(classData.timetable).some(day => classData.timetable[day]?.length > 0) && (
            <div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Timetable Overview</h4>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(classData.timetable).map(([day, periods]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 capitalize">{day}:</span>
                      <span className="text-sm text-gray-500">
                        {periods?.length || 0} periods
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onManageTimetable}
                  className="btn-outline mt-3 w-full text-sm sm:text-base"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  View Full Timetable
                </button>
              </div>
            </div>
          )}

          {/* Students List Preview */}
          {classData.students && classData.students.length > 0 && (
            <div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                Students ({classData.students.length})
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {classData.students.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 truncate mr-2">
                        {student.user?.firstName} {student.user?.lastName}
                      </span>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        Roll: {student.rollNumber}
                      </span>
                    </div>
                  ))}
                  {classData.students.length > 5 && (
                    <div className="text-sm text-gray-500 text-center pt-2 border-t">
                      +{classData.students.length - 5} more students
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={onManageTimetable}
              className="btn-outline w-full sm:w-auto text-sm sm:text-base"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Manage Timetable
            </button>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="btn-outline w-full sm:w-auto text-sm sm:text-base"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Class
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="btn-danger w-full sm:w-auto text-sm sm:text-base"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Class
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassDetailModal