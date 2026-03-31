import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

const statusStyles = {
  Active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const filters = ['All', 'Pending', 'Active', 'Completed', 'Cancelled']

export default function Bookings() {
  const { authFetch } = useAuth()
  const { addNotification } = useNotifications()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const res = await authFetch('/api/bookings/all')
    const data = await res.json()
    setBookings(res.ok ? data : [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const res = await authFetch(`/api/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
    const data = await res.json()
    if (!res.ok) return
    setBookings(b => b.map(x => x._id === id ? { ...x, status: data.status } : x))
    if (status === 'Cancelled') {
      const b = bookings.find(x => x._id === id)
      addNotification({ type: 'cancellation', title: 'Booking Cancelled', message: `Booking for ${b?.vehicleId?.name || 'vehicle'} was cancelled`, time: 'Just now' })
    }
  }

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter)
  const counts = filters.slice(1).reduce((acc, f) => ({ ...acc, [f]: bookings.filter(b => b.status === f).length }), {})

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bookings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{bookings.length} total bookings</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
            {f}
            {f !== 'All' && counts[f] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{counts[f]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="text-center text-slate-400 py-12 text-sm">Loading bookings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  {['Booking ID', 'Customer', 'Vehicle', 'Start', 'End', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">{'BK-' + b._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{b.userId?.name || '—'}<br /><span className="text-xs text-slate-400">{b.userId?.email}</span></td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.vehicleId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(b.startTime).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{new Date(b.endTime).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">₹{b.totalPrice}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {b.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(b._id, 'Active')} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Approve</button>
                          <button onClick={() => updateStatus(b._id, 'Cancelled')} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Reject</button>
                        </div>
                      )}
                      {b.status === 'Active' && (
                        <button onClick={() => updateStatus(b._id, 'Completed')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Mark Done</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">No bookings found.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
