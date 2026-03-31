import { useState } from 'react'
import { CheckCircle, XCircle, Eye, User } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const initialUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joined: '2025-06-10', kyc: 'Pending', doc: 'passport.jpg' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', joined: '2025-06-15', kyc: 'Approved', doc: 'license.jpg' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', joined: '2025-06-20', kyc: 'Pending', doc: 'id_card.jpg' },
  { id: 4, name: 'David Lee', email: 'david@example.com', joined: '2025-06-25', kyc: 'Rejected', doc: 'passport.jpg' },
  { id: 5, name: 'Eva Green', email: 'eva@example.com', joined: '2025-07-01', kyc: 'Pending', doc: 'license.jpg' },
]

const kycStyles = {
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Users() {
  const [users, setUsers] = useState(initialUsers)
  const [filter, setFilter] = useState('All')
  const { addNotification } = useNotifications()

  const updateKyc = (id, status) => {
    const user = users.find(u => u.id === id)
    setUsers(u => u.map(x => x.id === id ? { ...x, kyc: status } : x))
    addNotification({
      type: 'kyc',
      title: `KYC ${status}`,
      message: `${user.name}'s KYC was ${status.toLowerCase()}`,
      time: 'Just now',
    })
  }

  const filtered = filter === 'All' ? users : users.filter(u => u.kyc === filter)
  const counts = ['Pending', 'Approved', 'Rejected'].reduce((acc, f) => ({ ...acc, [f]: users.filter(u => u.kyc === f).length }), {})

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users & KYC</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users.length} registered users · {counts.Pending} pending review</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                {['User', 'Email', 'Joined', 'KYC Document', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                        <User size={14} className="text-slate-500 dark:text-slate-300" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{u.joined}</td>
                  <td className="px-5 py-3.5">
                    <button className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium">
                      <Eye size={13} /> {u.doc}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${kycStyles[u.kyc]}`}>{u.kyc}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.kyc === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateKyc(u.id, 'Approved')} className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => updateKyc(u.id, 'Rejected')} className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {u.kyc === 'Rejected' && (
                      <button onClick={() => updateKyc(u.id, 'Pending')} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Re-review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">No users found.</p>}
        </div>
      </div>
    </div>
  )
}
