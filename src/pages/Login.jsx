import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Car, Shield, TrendingUp, Clock } from 'lucide-react'

const features = [
  { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security for your fleet data' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track revenue, bookings and performance live' },
  { icon: Clock, title: '24/7 Management', desc: 'Manage your fleet anytime, from anywhere' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    if (result.success) navigate('/vendor')
    else setError(result.msg)
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotSent(true)
    } catch {
      setError('Could not send reset email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[52%] bg-slate-900 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">RentWheels</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your fleet.<br />
              <span className="text-blue-400">Grow your business.</span>
            </h2>
            <p className="text-slate-400 mt-4 text-base leading-relaxed max-w-sm">
              The all-in-one vendor platform for vehicle rentals. Track bookings, manage vehicles, and handle customer verification.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={15} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[['1,200+', 'Active Rentals'], ['98%', 'Uptime SLA'], ['4.9 / 5', 'Vendor Rating']].map(([val, label]) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white text-xl font-bold">{val}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">RentWheels</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{forgotMode ? 'Reset password' : 'Welcome back'}</h1>
            <p className="text-slate-500 text-sm mt-1.5">{forgotMode ? 'Enter your email to receive a reset link.' : 'Sign in to your vendor dashboard'}</p>
          </div>

          {forgotMode ? (
            forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p className="text-sm text-slate-600">If that email is registered, a reset link has been sent. Check your inbox.</p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail('') }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline">Back to sign in</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" required value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="vendor@rentwheels.com"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />{error}
                  </div>
                )}
                <button type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-sm">
                  Send reset link
                </button>
                <button type="button" onClick={() => { setForgotMode(false); setError('') }}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 underline">Back to sign in</button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vendor@rentwheels.com"
                  className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <button type="button" onClick={() => { setForgotMode(true); setError('') }}
                    className="text-xs text-blue-600 hover:text-blue-700">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {error}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">Note</p>
                <p className="text-xs text-blue-600">Register with role <strong>vendor</strong> via the API or use an existing vendor account.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
