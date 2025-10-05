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
            case 'first name':
            case 'firstname':
              row.firstName = value
              break
            case 'last name':
            case 'lastname':
              row.lastName = value
              break
            case 'email':
              row.email = value
              break
            case 'phone':
            case 'phone number':
              row.phone = value
              break
            case 'role':
              row.role = value.toLowerCase().replace(' ', '_')
              break
            case 'date of birth':
            case 'dob':
              row.dateOfBirth = value
              break
            case 'gender':
              row.gender = value.toLowerCase()
              break
            case 'address':
              row.address = value
              break
            case 'employee id':
            case 'employeeid':
              row.employeeId = value
              break
            case 'roll number':
            case 'rollnumber':
              row.rollNumber = value
              break
            case 'class':
            case 'class name':
              row.className = value
              break
            case 'section':
              row.section = value
              break
            case 'parent name':
            case 'parentname':
              row.parentName = value
              break
            case 'parent contact':
            case 'parentcontact':
              row.parentContact = value
              break
            case 'parent email':
            case 'parentemail':
              row.parentEmail = value
              break
            default:
              // Ignore unknown headers
              break
          }
        })

        if (row.firstName && row.lastName && row.phone) {
          // Set role based on userType if provided
          if (userType) {
            row.role = userType
          }
          
          // Find class ID if class name and section are provided
          if (row.className && row.section && classes.length > 0) {
            const matchingClass = classes.find(cls => 
              cls.name.toLowerCase() === row.className.toLowerCase() && 
              cls.section.toLowerCase() === row.section.toLowerCase()
            )
            if (matchingClass) {
              row.classId = matchingClass.id
            }
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
    bulkImportMutation.mutate({ users: csvData })
  }

  const downloadTemplate = () => {
    let template = ''
    
    if (userType === 'student') {
      template = `First Name,Last Name,Email,Phone,Date of Birth,Gender,Address,Roll Number,Class,Section,Parent Name,Parent Contact,Parent Email
John,Doe,john.doe@example.com,1234567890,2005-01-01,male,123 Main St,001,10,A,John Doe Sr,9876543210,parent@example.com
Jane,Smith,jane.smith@example.com,0987654321,2005-05-15,female,456 Oak Ave,002,10,A,Jane Smith Sr,8765432109,parent2@example.com
`
    } else if (userType === 'teacher') {
      template = `First Name,Last Name,Email,Phone,Date of Birth,Gender,Address,Employee ID
John,Doe,john.doe@example.com,1234567890,1990-01-01,male,123 Main St,EMP001
Jane,Smith,jane.smith@example.com,0987654321,1985-05-15,female,456 Oak Ave,EMP002
`
    } else {
      template = `First Name,Last Name,Email,Phone,Role,Date of Birth,Gender,Address,Employee ID
John,Doe,john.doe@example.com,1234567890,teacher,1990-01-01,male,123 Main St,EMP001
Jane,Smith,jane.smith@example.com,0987654321,student,2005-05-15,female,456 Oak Ave,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk User Import
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  {userType === 'student' ? 'Student' : userType === 'teacher' ? 'Teacher' : 'User'} Import Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload a CSV file with {userType || 'user'} data</li>
                  <li>• Required columns: First Name, Last Name, Phone{!userType && ', Role'}</li>
                  {userType === 'student' ? (
                    <>
                      <li>• Optional columns: Email, Date of Birth, Gender, Address, Roll Number, Class, Section</li>
                      <li>• Parent info: Parent Name, Parent Contact, Parent Email</li>
                      <li>• Class assignment: Use Class and Section columns to auto-assign</li>
                    </>
                  ) : userType === 'teacher' ? (
                    <>
                      <li>• Optional columns: Email, Date of Birth, Gender, Address, Employee ID</li>
                      <li>• Employee ID will be auto-generated if not provided</li>
                    </>
                  ) : (
                    <>
                      <li>• Optional columns: Email, Date of Birth, Gender, Address, Employee ID</li>
                      <li>• Valid roles: teacher, student, parent, finance_officer, support_staff</li>
                    </>
                  )}
                  <li>• Default passwords will be generated (firstname123)</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="btn-outline mb-4"
                >
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  Download Template
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Upload CSV File
                  </p>
                  <p className="text-gray-500">
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
                    className="btn-primary cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview Import Data ({csvData.length} users)
                </h3>
                <div className="space-x-2">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={bulkImportMutation.isLoading}
                    className="btn-primary"
                  >
                    {bulkImportMutation.isLoading ? 'Importing...' : 'Import Users'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                        Employee ID
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
                          {user.phone}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="badge badge-primary">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.employeeId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && results && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Import Results
              </h3>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card bg-green-50">
                  <div className="card-body text-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      {results.created.length}
                    </div>
                    <div className="text-sm text-green-700">
                      Users Created
                    </div>
                  </div>
                </div>
                <div className="card bg-red-50">
                  <div className="card-body text-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                      {results.errors.length}
                    </div>
                    <div className="text-sm text-red-700">
                      Errors
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Users */}
              {results.created.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Successfully Created Users
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {results.created.map((user, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
                        <div>
                          <span className="font-medium text-green-900">{user.name}</span>
                          <span className="text-green-700 ml-2">({user.role})</span>
                        </div>
                        <div className="text-sm text-green-600">
                          Password: {user.defaultPassword}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Import Errors
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="py-2 border-b border-red-200 last:border-b-0">
                        <div className="font-medium text-red-900">
                          Row {error.row}: {error.data.firstName} {error.data.lastName}
                        </div>
                        <div className="text-sm text-red-700">
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
                  className="btn-primary"
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