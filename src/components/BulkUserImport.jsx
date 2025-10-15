import { useState } from 'react'
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../utils/api'
import toast from 'react-hot-toast'

function BulkUserImport({ onClose, userType, classes = [] }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview, 3: Results
  const [csvData, setCsvData] = useState([])
  const [results, setResults] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const bulkImportMutation = useMutation({
    mutationFn: usersAPI.bulkCreate,
    onSuccess: (response) => {
      setResults(response.data.results)
      setStep(3)
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user-stats'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to import users')
    }
  })

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const data = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row = {}
        
        headers.forEach((header, index) => {
          const value = values[index] || ''
          
          // Map CSV headers to our user fields
          switch (header) {
            case 'name':
              // Split full name into first and last name
              const nameParts = value.trim().split(' ')
              row.firstName = nameParts[0] || ''
              row.lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'Student'
              break
            case 'first name':
            case 'firstname':
              row.firstName = value
              break
            case 'last name':
            case 'lastname':
              row.lastName = value
              break
            case 'email':
              row.email = value === '-' ? '' : value
              break
            case 'phone':
            case 'phone number':
              row.phone = value === '-' ? '' : value
              break
            case 'role':
              row.role = value.toLowerCase().replace(' ', '_')
              break
            case 'roll number':
            case 'rollnumber':
              row.rollNumber = value
              break
            case 'class':
              // Handle class format like "10 A" or "10A"
              if (value && value !== '-') {
                const classMatch = value.match(/^(\d+)\s*([A-Z]?)$/i)
                if (classMatch) {
                  row.classNameTemp = classMatch[1] // Class number (e.g., "10")
                  row.sectionTemp = classMatch[2] || 'A' // Section (e.g., "A")
                } else {
                  row.classNameTemp = value
                }
              }
              break
            case 'employee id':
            case 'employeeid':
              row.employeeId = value === '-' ? '' : value
              break
            default:
              // Ignore unknown headers
              break
          }
        })

        if (row.firstName && row.lastName) {
          // Set role based on userType if provided
          if (userType) {
            row.role = userType
          }
          
          // Find class ID if class name and section are provided
          if (row.classNameTemp && classes.length > 0) {
            let matchingClass;
            if (row.sectionTemp) {
              // Match both class name and section
              matchingClass = classes.find(cls => 
                cls.name.toLowerCase() === row.classNameTemp.toLowerCase() && 
                cls.section.toLowerCase() === row.sectionTemp.toLowerCase()
              )
            } else {
              // Match just class name if no section provided
              matchingClass = classes.find(cls => 
                cls.name.toLowerCase() === row.classNameTemp.toLowerCase()
              )
            }
            
            if (matchingClass) {
              row.classId = matchingClass.id
              row.classDisplayName = `${matchingClass.name} ${matchingClass.section || ''}`.trim()
            } else {
              row.classDisplayName = `${row.classNameTemp} ${row.sectionTemp || ''}`.trim() + ' (Not Found)'
            }
          }
          
          // Remove temporary fields (keep classDisplayName for preview)
          delete row.classNameTemp
          delete row.sectionTemp
          
          // Generate phone number if not provided (for students)
          if (!row.phone && userType === 'student') {
            row.phone = `9999${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
          }
          
          data.push(row)
        }
      }

      setCsvData(data)
      setStep(2)
    }

    reader.readAsText(file)
  }

  const handleImport = () => {
    // Clean the data before sending to backend - remove display-only fields
    const cleanedData = csvData.map(user => {
      const { classDisplayName, ...cleanUser } = user
      return cleanUser
    })
    
    bulkImportMutation.mutate({ users: cleanedData })
  }

  const downloadTemplate = () => {
    let template = ''
    
    if (userType === 'student') {
      template = `NAME,EMAIL,PHONE,ROLE,ROLL NUMBER,CLASS
John Doe,-,9999219980,student,1,10 A
Jane Smith,-,9999398329,student,2,10 A
Mike Johnson,-,9999715662,student,3,10 A
`
    } else if (userType === 'teacher') {
      template = `NAME,EMAIL,PHONE,ROLE,EMPLOYEE ID
John Doe,john.doe@example.com,9999123456,teacher,EMP001
Jane Smith,jane.smith@example.com,9999654321,teacher,EMP002
`
    } else {
      template = `NAME,EMAIL,PHONE,ROLE,ROLL NUMBER,CLASS
John Doe,john.doe@example.com,9999123456,teacher,-,-
Jane Smith,-,9999654321,student,1,10 A
`
    }
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${userType || 'user'}_import_template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Bulk User Import
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                  {userType === 'student' ? 'Student' : userType === 'teacher' ? 'Teacher' : 'User'} Import Instructions
                </h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Upload a CSV file with {userType || 'user'} data</li>
                  <li>• Required columns: NAME, ROLE, ROLL NUMBER, CLASS</li>
                  <li>• Optional columns: EMAIL, PHONE</li>
                  <li>• Use "-" for empty EMAIL or PHONE fields</li>
                  <li>• CLASS format: "10 A" or "9 B" (class number + section)</li>
                  <li>• Phone numbers will be auto-generated if empty or "-"</li>
                  <li>• Email can be added later to activate student accounts</li>
                  <li>• Default passwords will be generated (firstname123)</li>
                  <li>• Students can update their details later through their profile</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="btn-outline mb-4 w-full sm:w-auto"
                >
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  Download Template
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
                <DocumentArrowUpIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    Upload CSV File
                  </p>
                  <p className="text-sm sm:text-base text-gray-500">
                    Select a CSV file containing user data
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="btn-primary cursor-pointer inline-block w-full sm:w-auto"
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2 break-all">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Preview Import Data ({csvData.length} users)
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline w-full sm:w-auto"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={bulkImportMutation.isLoading}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {bulkImportMutation.isLoading ? 'Importing...' : 'Import Users'}
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Roll Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Class
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.email || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.phone || 'Auto-generated'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="badge badge-primary">
                            {(user.role || 'student').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.rollNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.classDisplayName || (user.classId ? 'Assigned' : 'Not assigned')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {csvData.map((user, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <span className="badge badge-primary text-xs mt-1">
                          {(user.role || 'student').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email: </span>
                        <span className="text-gray-900">{user.email || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone: </span>
                        <span className="text-gray-900">{user.phone || 'Auto-generated'}</span>
                      </div>
                      {user.rollNumber && (
                        <div>
                          <span className="text-gray-500">Roll Number: </span>
                          <span className="text-gray-900">{user.rollNumber}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Class: </span>
                        <span className="text-gray-900">
                          {user.classDisplayName || (user.classId ? 'Assigned' : 'Not assigned')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && results && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Import Results
              </h3>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="card bg-green-50">
                  <div className="card-body text-center p-4">
                    <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-green-900">
                      {results.created.length}
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">
                      Users Created
                    </div>
                  </div>
                </div>
                <div className="card bg-red-50">
                  <div className="card-body text-center p-4">
                    <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-xl sm:text-2xl font-bold text-red-900">
                      {results.errors.length}
                    </div>
                    <div className="text-xs sm:text-sm text-red-700">
                      Errors
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Users */}
              {results.created.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                    Successfully Created Users
                  </h4>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto">
                    {results.created.map((user, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-green-200 last:border-b-0 space-y-1 sm:space-y-0">
                        <div>
                          <span className="font-medium text-green-900 text-sm">{user.name}</span>
                          <span className="text-green-700 ml-0 sm:ml-2 text-xs sm:text-sm block sm:inline">({user.role})</span>
                        </div>
                        <div className="text-xs sm:text-sm text-green-600">
                          Password: <span className="font-mono">{user.defaultPassword}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
                    Import Errors
                  </h4>
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="py-2 border-b border-red-200 last:border-b-0">
                        <div className="font-medium text-red-900 text-sm">
                          Row {error.row}: {error.data.firstName} {error.data.lastName}
                        </div>
                        <div className="text-xs sm:text-sm text-red-700 mt-1">
                          {error.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-primary w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkUserImport