import { useState } from 'react'
import { Star } from 'lucide-react'

const initialFeedback = [
  { id: 1, user: 'Alice Johnson', vehicle: 'Toyota Camry', rating: 5, comment: 'Excellent car, very clean and well maintained. The pickup was smooth and the vendor was very responsive.', date: '2025-07-05', bookingId: 'BK001' },
  { id: 2, user: 'Bob Smith', vehicle: 'Honda Civic', rating: 4, comment: 'Good experience overall. The car was in great condition. Minor delay in confirmation but resolved quickly.', date: '2025-07-06', bookingId: 'BK002' },
  { id: 3, user: 'Carol White', vehicle: 'Ford Explorer', rating: 3, comment: 'Average experience. The car had a small scratch that was not mentioned in the listing. Otherwise fine.', date: '2025-07-01', bookingId: 'BK003' },
  { id: 4, user: 'David Lee', vehicle: 'BMW X5', rating: 5, comment: 'Absolutely fantastic! The BMW X5 was in perfect condition. Will definitely rent again.', date: '2025-07-04', bookingId: 'BK004' },
  { id: 5, user: 'Eva Green', vehicle: 'Tesla Model 3', rating: 2, comment: 'Disappointed with the experience. The car was not fully charged as promised and the AC had issues.', date: '2025-07-02', bookingId: 'BK005' },
  { id: 6, user: 'Frank Miller', vehicle: 'Toyota Camry', rating: 4, comment: 'Great car and easy process. The vendor was helpful and accommodating with timing.', date: '2025-07-07', bookingId: 'BK006' },
]

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600 fill-slate-200 dark:fill-slate-600'} />
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-3">{star}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 w-4 text-right">{count}</span>
    </div>
  )
}

export default function Feedback() {
  const [filter, setFilter] = useState(0)

  const avg = (initialFeedback.reduce((s, f) => s + f.rating, 0) / initialFeedback.length).toFixed(1)
  const counts = [5, 4, 3, 2, 1].map(s => ({ star: s, count: initialFeedback.filter(f => f.rating === s).length }))
  const filtered = filter === 0 ? initialFeedback : initialFeedback.filter(f => f.rating === filter)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feedback & Ratings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Customer reviews across all your vehicles</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall score */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-slate-900 dark:text-white">{avg}</p>
          <StarDisplay rating={Math.round(avg)} size={20} />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{initialFeedback.length} total reviews</p>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-2.5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Rating Breakdown</p>
          {counts.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={initialFeedback.length} />
          ))}
        </div>

        {/* Per vehicle avg */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">By Vehicle</p>
          <div className="space-y-3">
            {['Toyota Camry', 'Honda Civic', 'Ford Explorer', 'BMW X5', 'Tesla Model 3'].map(v => {
              const vFeedback = initialFeedback.filter(f => f.vehicle === v)
              if (!vFeedback.length) return null
              const vAvg = (vFeedback.reduce((s, f) => s + f.rating, 0) / vFeedback.length).toFixed(1)
              return (
                <div key={v} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{v}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{vFeedback.length} review{vFeedback.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{vAvg}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filter by stars */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter(0)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 0 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
          All Reviews
        </button>
        {[5, 4, 3, 2, 1].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <Star size={12} className={filter === s ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
            {s} Star{s > 1 ? 's' : ''}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{f.user[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.user}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{f.vehicle} · {f.bookingId}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StarDisplay rating={f.rating} />
                <span className="text-xs text-slate-400 dark:text-slate-500">{f.date}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.comment}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400 dark:text-slate-500 text-sm">No reviews found for this rating.</div>
        )}
      </div>
    </div>
  )
}
