import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SchoolProvider } from './contexts/SchoolContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'

import Dashboard from './pages/Dashboard'
import Schools from './pages/super-admin/Schools'
import SchoolDetail from './pages/super-admin/SchoolDetail'
import InterestedVisitors from './pages/super-admin/InterestedVisitors'
import Subscriptions from './pages/super-admin/Subscriptions'
import Payments from './pages/super-admin/Payments'
import Analytics from './pages/super-admin/Analytics'
import Users from './pages/Users'
import Teachers from './pages/Teachers'
import Students from './pages/Students'
import Classes from './pages/Classes'
import Attendance from './pages/Attendance'
import Homework from './pages/Homework'
import Events from './pages/Events'
import Complaints from './pages/Complaints'
import Fees from './pages/Fees'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import ManageSubscription from './pages/ManageSubscription'
import SubscriptionUpgrade from './pages/SubscriptionUpgrade'
import Debug from './pages/Debug'

function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manage-subscription" element={
              <ProtectedRoute roles={['principal', 'school_admin']}>
                <ManageSubscription />
              </ProtectedRoute>
            } />
            
            {/* Super Admin routes */}
            <Route path="schools" element={
              <ProtectedRoute roles={['super_admin']}>
                <Schools />
              </ProtectedRoute>
            } />
            <Route path="schools/:id" element={
              <ProtectedRoute roles={['super_admin']}>
                <SchoolDetail />
              </ProtectedRoute>
            } />
            <Route path="interested-visitors" element={
              <ProtectedRoute roles={['super_admin']}>
                <InterestedVisitors />
              </ProtectedRoute>
            } />
            <Route path="subscriptions" element={
              <ProtectedRoute roles={['super_admin']}>
                <Subscriptions />
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute roles={['super_admin']}>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute roles={['super_admin']}>
                <Analytics />
              </ProtectedRoute>
            } />
            
            {/* School management routes */}
            <Route path="users" element={
              <ProtectedRoute roles={['super_admin', 'school_admin', 'principal']}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="teachers" element={
              <ProtectedRoute roles={['super_admin', 'school_admin', 'principal']}>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="students" element={
              <ProtectedRoute roles={['school_admin', 'principal', 'teacher']}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="classes" element={
              <ProtectedRoute roles={['super_admin', 'school_admin', 'principal', 'teacher']}>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="attendance" element={
              <ProtectedRoute roles={['super_admin', 'school_admin', 'principal', 'teacher']}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="homework" element={<Homework />} />
            <Route path="events" element={<Events />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="fees" element={<Fees />} />
            <Route path="reports" element={
              <ProtectedRoute roles={['school_admin', 'principal', 'teacher']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="subscription/upgrade" element={<SubscriptionUpgrade />} />
            <Route path="debug" element={<Debug />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SchoolProvider>
    </AuthProvider>
  )
}

export default App