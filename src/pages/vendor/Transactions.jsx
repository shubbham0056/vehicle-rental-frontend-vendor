import { useState } from 'react'
import { Download, Search, TrendingUp, TrendingDown, CreditCard, IndianRupee } from 'lucide-react'

const transactions = [
  { id: 'TXN-001', orderId: 'order_RZP9xK2mL1', bookingId: 'BK001', user: 'Alice Johnson', vehicle: 'Toyota Camry', amount: 26560, method: 'UPI', status: 'Captured', date: '2025-07-01 10:32 AM' },
  { id: 'TXN-002', orderId: 'order_RZP8wJ1nM2', bookingId: 'BK002', user: 'Bob Smith', vehicle: 'Honda Civic', amount: 19920, method: 'Card', status: 'Captured', date: '2025-07-03 02:15 PM' },
  { id: 'TXN-003', orderId: 'order_RZP7vI0oN3', bookingId: 'BK003', user: 'Carol White', vehicle: 'Ford Explorer', amount: 27390, method: 'Net Banking', status: 'Refunded', date: '2025-06-28 09:00 AM' },
  { id: 'TXN-004', orderId: 'order_RZP6uH9pO4', bookingId: 'BK004', user: 'David Lee', vehicle: 'BMW X5', amount: 37350, method: 'UPI', status: 'Captured', date: '2025-07-07 11:45 AM' },
  { id: 'TXN-005', orderId: 'order_RZP5tG8qP5', bookingId: 'BK005', user: 'Eva Green', vehicle: 'Tesla Model 3', amount: 14940, method: 'Wallet', status: 'Failed', date: '2025-07-02 04:20 PM' },
  { id: 'TXN-006', orderId: 'order_RZP4sF7rQ6', bookingId: 'BK006', user: 'Frank Miller', vehicle: 'Toyota Camry', amount: 6640, method: 'Card', status: 'Captured', date: '2025-07-07 08:10 AM' },
  { id: 'TXN-007', orderId: 'order_RZP3rE6sR7', bookingId: 'BK007', user: 'Grace Lee', vehicle: 'Honda Civic', amount: 9960, method: 'UPI', status: 'Pending', date: '2025-07-08 01:00 PM' },
]

const statusStyles = {
  Captured: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const methodIcons = { UPI: '⬡', Card: '▣', 'Net Banking': '⊞', Wallet: '◈' }

const filters = ['All', 'Captured', 'Pending', 'Refunded', 'Failed']

export default function Transactions() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const captured = transactions.filter(t => t.status === 'Captured')
  const totalRevenue = captured.reduce((s, t) => s + t.amount, 0)
  const totalRefunded = transactions.filter(t => t.status === 'Refunded').reduce((s, t) => s + t.amount, 0)

  const filtered = transactions.filter(t => {
    const matchFilter = filter === 'All' || t.status === filter
    const matchSearch = search === '' ||
      t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const fmt = (n) => `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All Razorpay payment records</p>
        </div>
        <button className="flex items-center gap-2 text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', sub: `${captured.length} successful` },
          { label: 'Total Refunded', value: fmt(totalRefunded), icon: TrendingDown, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', sub: `${transactions.filter(t => t.status === 'Refunded').length} refunds` },
          { label: 'Failed Payments', value: transactions.filter(t => t.status === 'Failed').length, icon: CreditCard, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', sub: 'Needs attention' },
          { label: 'Pending', value: transactions.filter(t => t.status === 'Pending').length, icon: IndianRupee, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', sub: 'Awaiting capture' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, ID, vehicle..."
            className="pl-8 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 w-64" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                {['Transaction ID', 'Razorpay Order ID', 'Customer', 'Vehicle', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.id}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.orderId}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{t.user}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{t.vehicle}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{fmt(t.amount)}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                      <span className="text-base leading-none">{methodIcons[t.method]}</span>
                      {t.method}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">No transactions found.</p>}
        </div>
      </div>
    </div>
  )
}
