import { useEffect, useState } from 'react'
import { TrendingUp, Car, CalendarCheck, Users, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const statusStyles = {
  Active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { authFetch } = useAuth()
  const [bookings, setBookings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      authFetch('/api/bookings/all').then(r => r.json()),
      fetch('/api/vehicles').then(r => r.json()),
    ]).then(([b, v]) => {
      setBookings(Array.isArray(b) ? b : [])
      setVehicles(Array.isArray(v) ? v : [])
      setLoading(false)
    }).catch(() => {
      setBookings([])
      setVehicles([])
      setLoading(false)
    })
  }, [])

  const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0)
  const activeVehicles = vehicles.filter(v => v.status === 'Available').length
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  // Monthly revenue for chart
  const monthlyRevenue = Array(12).fill(0)
  bookings.forEach(b => {
    const m = new Date(b.createdAt).getMonth()
    monthlyRevenue[m] += b.totalPrice || 0
  })
  const maxVal = Math.max(...monthlyRevenue, 1)

  const fleetAvailable   = vehicles.filter(v => v.status === 'Available').length
  const fleetRented      = vehicles.filter(v => v.status === 'Rented').length
  const fleetMaintenance = vehicles.filter(v => v.status === 'Maintenance').length
  const fleetTotal       = vehicles.length || 1

  const stats = [
    { label: 'Total Bookings',  value: bookings.length,           icon: CalendarCheck, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Active Vehicles', value: activeVehicles,            icon: Car,           color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
    { label: 'Pending Bookings',value: pendingBookings,           icon: Users,         color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  ]

  if (loading) return <div className="p-6 text-slate-400">Loading dashboard...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={13} /> Live
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monthly revenue (₹)</p>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {monthlyRevenue.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
                  style={{ height: `${(v / maxVal) * 100}%`, minHeight: v > 0 ? '4px' : '0' }}
                  title={`₹${v}`}
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Fleet Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Available',   count: fleetAvailable,   color: 'bg-emerald-500' },
              { label: 'Rented',      count: fleetRented,      color: 'bg-blue-500' },
              { label: 'Maintenance', count: fleetMaintenance, color: 'bg-amber-500' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
                  <span className="text-slate-400 dark:text-slate-500">{count} / {fleetTotal}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / fleetTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Stats</p>
            {[
              ['Total Vehicles', vehicles.length],
              ['Bookings Today', bookings.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length],
              ['Completed', bookings.filter(b => b.status === 'Completed').length],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">{k}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                {['Booking ID','Customer','Vehicle','Date','Amount','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recent.map(b => (
                <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">{'BK-' + b._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{b.userId?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.vehicleId?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">₹{b.totalPrice}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
