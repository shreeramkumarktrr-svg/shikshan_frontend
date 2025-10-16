import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from './LoadingSpinner'

function TimetableModal({ class: classData, onSave, onClose, isLoading }) {
  const [timetable, setTimetable] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  })

  useEffect(() => {
    if (classData?.timetable) {
      setTimetable({
        monday: classData.timetable.monday || [],
        tuesday: classData.timetable.tuesday || [],
        wednesday: classData.timetable.wednesday || [],
        thursday: classData.timetable.thursday || [],
        friday: classData.timetable.friday || [],
        saturday: classData.timetable.saturday || []
      })
    }
  }, [classData])

  const timeSlots = [
    '08:00-08:45',
    '08:45-09:30',
    '09:30-10:15',
    '10:15-11:00',
    '11:15-12:00', // Break after 4th period
    '12:00-12:45',
    '12:45-13:30',
    '14:30-15:15', // Lunch break
    '15:15-16:00'
  ]

  const subjects = classData?.subjects || [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music'
  ]

  const addPeriod = (day) => {
    const newPeriod = {
      period: timetable[day].length + 1,
      subject: '',
      teacher: '',
      time: timeSlots[timetable[day].length] || ''
    }
    
    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], newPeriod]
    }))
  }

  const removePeriod = (day, index) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }))
  }

  const updatePeriod = (day, index, field, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }))
  }

  const handleSave = () => {
    // Validate timetable
    const isValid = Object.values(timetable).every(daySchedule =>
      daySchedule.every(period => period.subject && period.time)
    )

    if (!isValid) {
      alert('Please fill in all required fields (Subject and Time) for all periods.')
      return
    }

    onSave(timetable)
  }

  const copyFromDay = (sourceDay, targetDay) => {
    if (window.confirm(`Copy timetable from ${sourceDay} to ${targetDay}?`)) {
      setTimetable(prev => ({
        ...prev,
        [targetDay]: [...prev[sourceDay]]
      }))
    }
  }

  const clearDay = (day) => {
    if (window.confirm(`Clear all periods for ${day}?`)) {
      setTimetable(prev => ({
        ...prev,
        [day]: []
      }))
    }
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Manage Timetable
            </h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">
              {classData?.name} - Grade {classData?.grade} Section {classData?.section}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 self-end sm:self-auto"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(98vh-140px)] sm:max-h-[calc(90vh-140px)]">
          <div className="space-y-4 sm:space-y-6">
            {days.map(({ key: day, label }) => (
              <div key={day} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">{label}</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          copyFromDay(e.target.value, day)
                          e.target.value = ''
                        }
                      }}
                      className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                    >
                      <option value="">Copy from...</option>
                      {days.filter(d => d.key !== day).map(d => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => addPeriod(day)}
                      className="btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto"
                    >
                      <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Add Period
                    </button>
                    <button
                      onClick={() => clearDay(day)}
                      className="btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                      Clear Day
                    </button>
                  </div>
                </div>

                {timetable[day].length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <div className="text-sm sm:text-base">No periods scheduled for {label.toLowerCase()}</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timetable[day].map((period, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        {/* Mobile Layout */}
                        <div className="sm:hidden space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
                              Period {index + 1}
                            </span>
                            <button
                              onClick={() => removePeriod(day, index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove period"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                              <select
                                value={period.time}
                                onChange={(e) => updatePeriod(day, index, 'time', e.target.value)}
                                className="input text-sm w-full"
                                required
                              >
                                <option value="">Select time</option>
                                {timeSlots.map(slot => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                              <select
                                value={period.subject}
                                onChange={(e) => updatePeriod(day, index, 'subject', e.target.value)}
                                className="input text-sm w-full"
                                required
                              >
                                <option value="">Select subject</option>
                                {subjects.map(subject => (
                                  <option key={subject} value={subject}>{subject}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                              <input
                                type="text"
                                value={period.teacher}
                                onChange={(e) => updatePeriod(day, index, 'teacher', e.target.value)}
                                placeholder="Teacher name"
                                className="input text-sm w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                          <div className="col-span-1">
                            <span className="text-sm font-medium text-gray-700">
                              P{index + 1}
                            </span>
                          </div>
                          
                          <div className="col-span-3">
                            <select
                              value={period.time}
                              onChange={(e) => updatePeriod(day, index, 'time', e.target.value)}
                              className="input input-sm w-full"
                              required
                            >
                              <option value="">Select time</option>
                              {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <select
                              value={period.subject}
                              onChange={(e) => updatePeriod(day, index, 'subject', e.target.value)}
                              className="input input-sm w-full"
                              required
                            >
                              <option value="">Select subject</option>
                              {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-4">
                            <input
                              type="text"
                              value={period.teacher}
                              onChange={(e) => updatePeriod(day, index, 'teacher', e.target.value)}
                              placeholder="Teacher name"
                              className="input input-sm w-full"
                            />
                          </div>

                          <div className="col-span-1">
                            <button
                              onClick={() => removePeriod(day, index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove period"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Actions</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  const standardTimetable = {
                    monday: [
                      { period: 1, subject: 'Mathematics', teacher: '', time: '08:00-08:45' },
                      { period: 2, subject: 'English', teacher: '', time: '08:45-09:30' },
                      { period: 3, subject: 'Physics', teacher: '', time: '09:30-10:15' },
                      { period: 4, subject: 'Chemistry', teacher: '', time: '10:15-11:00' },
                      { period: 5, subject: 'Biology', teacher: '', time: '11:15-12:00' },
                      { period: 6, subject: 'Physical Education', teacher: '', time: '12:00-12:45' }
                    ]
                  }
                  setTimetable(prev => ({ ...prev, ...standardTimetable }))
                }}
                className="btn-outline text-xs sm:text-sm px-3 py-2 w-full sm:w-auto"
              >
                Load Sample Timetable
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('Clear entire timetable?')) {
                    setTimetable({
                      monday: [], tuesday: [], wednesday: [], 
                      thursday: [], friday: [], saturday: []
                    })
                  }
                }}
                className="btn-outline text-xs sm:text-sm px-3 py-2 text-red-600 w-full sm:w-auto"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline w-full sm:w-auto order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary w-full sm:w-auto order-1 sm:order-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Timetable'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimetableModal