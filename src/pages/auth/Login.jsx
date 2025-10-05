import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'

function Login() {
  const [loginType, setLoginType] = useState('password') // 'password' or 'otp'
  const { login, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/app/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  if (isAuthenticated) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Shikshan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your school
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Login Type Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('password')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginType === 'password'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginType('otp')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginType === 'otp'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              OTP
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                {loginType === 'password' ? 'Email or Phone' : 'Phone Number'}
              </label>
              <div className="mt-1">
                <input
                  {...register('identifier', {
                    required: 'This field is required',
                    validate: (value) => {
                      if (loginType === 'otp') {
                        return /^\d{10,15}$/.test(value) || 'Please enter a valid phone number'
                      }
                      return true
                    }
                  })}
                  type={loginType === 'otp' ? 'tel' : 'text'}
                  className={`input ${errors.identifier ? 'input-error' : ''}`}
                  placeholder={loginType === 'password' ? 'Enter email or phone' : 'Enter phone number'}
                />
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                )}
              </div>
            </div>

            {loginType === 'password' ? (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className={`input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <div className="mt-1">
                  <input
                    {...register('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                    type="text"
                    maxLength="6"
                    className={`input ${errors.otp ? 'input-error' : ''}`}
                    placeholder="Enter 6-digit OTP"
                  />
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    For demo, use OTP: 123456
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login