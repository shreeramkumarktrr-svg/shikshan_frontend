import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Handle feature access errors specifically
      if (error.response?.data?.code === 'FEATURE_NOT_AVAILABLE') {
        toast.error(`Feature not available: ${error.response.data.feature}`)
      } else if (error.response?.data?.code === 'SUBSCRIPTION_INACTIVE') {
        toast.error('Your subscription is not active')
      } else {
        toast.error('Access denied')
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  otpLogin: (data) => api.post('/auth/otp-login', data)
}

// Schools API
export const schoolsAPI = {
  getAll: (params) => api.get('/schools', { params }),
  getById: (id) => api.get(`/schools/${id}`),
  create: (data) => api.post('/schools', data),
  update: (id, data) => api.put(`/schools/${id}`, data),
  updateSubscription: (id, data) => api.put(`/schools/${id}/subscription`, data),
  delete: (id) => api.delete(`/schools/${id}`),
  getStats: (id) => api.get(`/schools/${id}/stats`)
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
  getStats: () => api.get('/users/stats/summary'),
  bulkCreate: (data) => api.post('/users/bulk', data),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  updateStatus: (id, data) => api.patch(`/users/${id}/status`, data),
  getByRole: (role, params) => api.get(`/users/role/${role}`, { params }),
  getActivity: (id, params) => api.get(`/users/${id}/activity`, { params })
}

// Classes API
export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getTimetable: (id) => api.get(`/classes/${id}/timetable`),
  updateTimetable: (id, data) => api.put(`/classes/${id}/timetable`, data),
  getStudents: (id) => api.get(`/classes/${id}/students`)
}

// Attendance API
export const attendanceAPI = {
  // Student attendance
  mark: (data) => api.post('/attendance', data),
  getByClass: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getReport: (params) => api.get('/attendance/report', { params }),
  export: (params) => api.get('/attendance/export', { params }),
  
  // Staff attendance
  markStaff: (data) => api.post('/attendance/staff', data),
  getStaff: (params) => api.get('/attendance/staff', { params }),
  getStaffStats: (params) => api.get('/attendance/staff/stats', { params }),
  updateStaff: (id, data) => api.put(`/attendance/staff/${id}`, data),
  getStaffReport: (params) => api.get('/attendance/staff/report', { params }),
  
  // Overview and statistics
  getOverview: (params) => api.get('/attendance/stats/overview', { params }),
  getStudentStats: (params) => api.get('/attendance/stats/students', { params })
}

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  markAsRead: (id) => api.put(`/events/${id}/read`),
  getStats: () => api.get('/events/stats/summary')
}

// Homework API
export const homeworkAPI = {
  getAll: (params) => api.get('/homework', { params }),
  getById: (id) => api.get(`/homework/${id}`),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
  submit: (id, data) => api.post(`/homework/${id}/submit`, data),
  grade: (homeworkId, submissionId, data) => api.put(`/homework/${homeworkId}/submissions/${submissionId}/grade`, data),
  getStats: (params) => api.get('/homework/stats/overview', { params })
}

// Complaints API
export const complaintsAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  addUpdate: (id, data) => api.post(`/complaints/${id}/updates`, data),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  getStats: () => api.get('/complaints/stats')
}

// Fees API
export const feesAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  generate: (data) => api.post('/fees/generate', data),
  getStats: (params) => api.get('/fees/stats/overview', { params }),
  getMyFees: () => api.get('/fees/my-fees'),
  getMyStats: () => api.get('/fees/my-stats'),
  getStudentFees: (studentId, params) => api.get(`/fees/student/${studentId}`, { params }),
  recordPayment: (studentFeeId, data) => api.post(`/fees/payment/${studentFeeId}`, data),
  getStructure: (params) => api.get('/fees/structure', { params }),
  createStructure: (data) => api.post('/fees/structure', data),
  updateStructure: (id, data) => api.put(`/fees/structure/${id}`, data),
  generateInvoices: (data) => api.post('/fees/invoices/generate', data),
  getInvoices: (params) => api.get('/fees/invoices', { params }),
  payInvoice: (id, data) => api.post(`/fees/invoices/${id}/pay`, data),
  getPayments: (params) => api.get('/fees/payments', { params }),
  getReport: (params) => api.get('/fees/report', { params })
}

// Reports API
export const reportsAPI = {
  getAttendance: (params) => api.get('/reports/attendance', { params }),
  getFees: (params) => api.get('/reports/fees', { params }),
  getProgress: (params) => api.get('/reports/progress', { params }),
  getCustom: (params) => api.get('/reports/custom', { params }),
  export: (type, params) => api.get(`/reports/${type}/export`, { params })
}

// Contact API
export const contactAPI = {
  send: (data) => api.post('/contact/send', data),
  test: () => api.get('/contact/test')
}

// Alias for backward compatibility
export const classAPI = classesAPI

export default api