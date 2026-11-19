/**
 * VerifyEmail — legacy link-based email verification page.
 *
 * Still reachable via /verify-email?token=<token> for any tokens that were
 * generated before the OTP migration.  After successful verification the
 * backend now returns JWT tokens so we auto-login and redirect to the correct
 * dashboard for each role.
 */
import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, XCircle } from 'lucide-react'

function dashboardForRole(role) {
  if (role === 'student') return '/student/dashboard'
  if (role === 'company') return '/company/dashboard'
  if (role === 'college') return '/admin/dashboard'
  if (role === 'admin')   return '/admin/dashboard'
  return '/portal'
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const { loginFromTokens } = useAuth()
  const [status,  setStatus]  = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    authAPI.verifyEmail(token)
      .then((res) => {
        setStatus('success')
        const { access, refresh, user } = res.data
        if (access && user) {
          loginFromTokens(access, refresh, user)
          setTimeout(() => navigate(dashboardForRole(user.role)), 2000)
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verification failed.')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Redirecting you to your dashboard…
            </p>
            <Link to="/portal" className="btn-primary inline-block">
              Go to Portal
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-4">{message}</p>
            <Link to="/register" className="btn-primary inline-block">
              Register again
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
