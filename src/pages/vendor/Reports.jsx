import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, MessageSquare, X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const initialReports = [
  { id: 1, user: 'Carol White', vehicle: 'Ford Explorer', category: 'Vehicle Damage', description: 'There is a scratch on the rear bumper that was not there when I picked up the vehicle.', date: '2025-07-03', status: 'Open', priority: 'High' },
  { id: 2, user: 'Alice Johnson', vehicle: 'Toyota Camry', category: 'Billing Issue', description: 'I was charged twice for the same booking. Please review and refund the extra charge.', date: '2025-07-02', status: 'In Review', priority: 'Medium' },
  { id: 3, user: 'David Lee', vehicle: 'BMW X5', category: 'Late Return', description: 'The previous renter returned the car 3 hours late and I could not pick it up on time.', date: '2025-07-01', status: 'Resolved', priority: 'Low' },
  { id: 4, user: 'Eva Green', vehicle: 'Tesla Model 3', category: 'Vehicle Condition', description: 'The car was not cleaned before my rental. The interior was dirty.', date: '2025-06-30', status: 'Open', priority: 'Medium' },
]

const statusStyles = {
  Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'In Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const priorityStyles = {
  High: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

const filters = ['All', 'Open', 'In Review', 'Resolved']

export default function Reports() {
  const [reports, setReports] = useState(initialReports)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const { addNotification } = useNotifications()

  const updateStatus = (id, status) => {
    setReports(r => r.map(x => x.id === id ? { ...x, status } : x))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
    if (status === 'Resolved') {
      const report = reports.find(r => r.id === id)
      addNotification({ type: 'report', title: 'Report Resolved', message: `${report.user}'s report has been resolved`, time: 'Just now' })
    }
  }

  const filtered = filter === 'All' ? reports : reports.filter(r => r.status === filter)
  const counts = ['Open', 'In Review', 'Resolved'].reduce((acc, f) => ({ ...acc, [f]: reports.filter(r => r.status === f).length }), {})

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{counts.Open} open · {counts['In Review']} in review · {counts.Resolved} resolved</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.status === 'Resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {r.status === 'Resolved'
                    ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                    : <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.category}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{r.user} · {r.vehicle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[r.priority]}`}>{r.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[r.status]}`}>{r.status}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{r.description}</p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock size={11} /> {r.date}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(r)}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  <MessageSquare size={12} /> View Details
                </button>
                {r.status === 'Open' && (
                  <button onClick={() => updateStatus(r.id, 'In Review')}
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg transition-colors font-medium">
                    Review
                  </button>
                )}
                {r.status === 'In Review' && (
                  <button onClick={() => updateStatus(r.id, 'Resolved')}
                    className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg transition-colors font-medium">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400 dark:text-slate-500 text-sm">No reports found.</div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Report Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Customer', selected.user], ['Vehicle', selected.vehicle], ['Category', selected.category], ['Date', selected.date]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{k}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityStyles[selected.priority]}`}>{selected.priority} Priority</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[selected.status]}`}>{selected.status}</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">{selected.description}</p>
              </div>
              <div className="flex gap-3 pt-1">
                {selected.status === 'Open' && (
                  <button onClick={() => updateStatus(selected.id, 'In Review')}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                    Mark In Review
                  </button>
                )}
                {selected.status === 'In Review' && (
                  <button onClick={() => updateStatus(selected.id, 'Resolved')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                    Mark Resolved
                  </button>
                )}
                <button onClick={() => setSelected(null)}
                  className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
