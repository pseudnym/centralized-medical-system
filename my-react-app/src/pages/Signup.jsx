import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, createPatientRow } from '../api/auth'

function EyeIcon({ show }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

export default function Signup() {
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { data, error: err } = await signup({ email, password, name, dateOfBirth })
      if (err) {
        setError(err.message || 'Sign up failed')
        return
      }
      if (data?.user) {
        if (data.user.identities?.length === 0) {
          setError('An account with this email already exists. Sign in instead.')
          return
        }
        const { error: patientErr } = await createPatientRow({
          userId: data.user.id,
          name,
          email,
          dob: dateOfBirth,
        })
        if (patientErr) {
          setError(patientErr.message || 'Account created but patient record failed. Please contact support.')
          return
        }
        setSuccess('Account created. Check your email to confirm, or sign in if already confirmed.')
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">
              <span className="auth-logo-inner" />
            </div>
            <span className="auth-brand-name">Angel</span>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="auth-success" role="status">
                {success}
              </div>
            )}
            <label className="auth-label">
              Name
              <input
                type="text"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                required
              />
            </label>
            <label className="auth-label">
              Date of birth
              <input
                type="date"
                className="auth-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Email
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
              />
            </label>
            <label className="auth-label">
              Password
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </label>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-panel-right-tagline">
          <p className="auth-panel-right-tagline-title">Introducing Angel</p>
          <p className="auth-panel-right-tagline-text">
            Your centralized health hub. Records, prescriptions, and appointments in one place.
          </p>
        </div>
      </div>
    </div>
  )
}
