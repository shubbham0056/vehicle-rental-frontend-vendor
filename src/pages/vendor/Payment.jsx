import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, AlertCircle, IndianRupee, Loader } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

// Razorpay Key — replace with your actual key from Razorpay Dashboard
const RAZORPAY_KEY = 'rzp_test_YourKeyHere'

const pendingPayments = [
  { id: 'PAY-001', bookingId: 'BK002', user: 'Bob Smith', vehicle: 'Honda Civic', amount: 19920, duration: '3 days', email: 'bob@example.com', phone: '9800000001' },
  { id: 'PAY-002', bookingId: 'BK004', user: 'David Lee', vehicle: 'BMW X5', amount: 37350, duration: '3 days', email: 'david@example.com', phone: '9800000002' },
  { id: 'PAY-003', bookingId: 'BK007', user: 'Grace Lee', vehicle: 'Honda Civic', amount: 9960, duration: '1 day', email: 'grace@example.com', phone: '9800000003' },
]

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Payment() {
  const [payments, setPayments] = useState(pendingPayments)
  const [loading, setLoading] = useState(null)
  const [sdkReady, setSdkReady] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    loadRazorpay().then(setSdkReady)
  }, [])

  const fmt = (n) => `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const handlePayment = async (payment) => {
    if (!sdkReady) {
      alert('Razorpay SDK failed to load. Check your internet connection.')
      return
    }
    setLoading(payment.id)

    // In production: call your backend to create a Razorpay order and get order_id
    // For demo, we simulate an order_id
    const simulatedOrderId = `order_demo_${Date.now()}`

    const options = {
      key: RAZORPAY_KEY,
      amount: payment.amount,
      currency: 'INR',
      name: 'RentWheels',
      description: `Booking ${payment.bookingId} — ${payment.vehicle}`,
      order_id: simulatedOrderId,
      prefill: {
        name: payment.user,
        email: payment.email,
        contact: payment.phone,
      },
      theme: { color: '#2563eb' },
      handler: (response) => {
        setPayments(p => p.filter(x => x.id !== payment.id))
        addNotification({
          type: 'booking',
          title: 'Payment Received',
          message: `${payment.user} paid ${fmt(payment.amount)} for ${payment.vehicle}`,
          time: 'Just now',
        })
        setLoading(null)
      },
      modal: {
        ondismiss: () => setLoading(null),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', () => {
      addNotification({
        type: 'cancellation',
        title: 'Payment Failed',
        message: `Payment failed for ${payment.user} — ${payment.vehicle}`,
        time: 'Just now',
      })
      setLoading(null)
    })
    rzp.open()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payments</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Collect payments from customers via Razorpay</p>
      </div>

      {/* SDK status */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${sdkReady ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
        {sdkReady
          ? <><CheckCircle size={16} /> Razorpay SDK loaded — ready to collect payments</>
          : <><Loader size={16} className="animate-spin" /> Loading Razorpay SDK...</>}
      </div>

      {/* Setup notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">Setup Required</p>
          <p>Replace <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-xs">rzp_test_YourKeyHere</code> in <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-xs">Payment.jsx</code> with your Razorpay Test Key ID from the <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="underline">Razorpay Dashboard</a>. In production, generate <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-xs">order_id</code> from your backend using the Razorpay Orders API.</p>
        </div>
      </div>

      {/* Pending payments */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Pending Payments ({payments.length})</h3>
        {payments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">All payments collected</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">No pending payments at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {payments.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{p.user}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{p.vehicle} · {p.duration}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{p.bookingId}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1.5">
                  {[['Email', p.email], ['Phone', p.phone]].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{k}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <IndianRupee size={16} className="text-slate-700 dark:text-slate-200" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{fmt(p.amount)}</span>
                  </div>
                  <button onClick={() => handlePayment(p)} disabled={loading === p.id || !sdkReady}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
                    {loading === p.id
                      ? <><Loader size={14} className="animate-spin" /> Processing...</>
                      : <><CreditCard size={14} /> Collect Payment</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">How Razorpay Integration Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Create Order', desc: 'Backend calls Razorpay Orders API with amount and currency to get an order_id' },
            { step: '02', title: 'Open Checkout', desc: 'Frontend opens Razorpay checkout modal with the order_id and customer details' },
            { step: '03', title: 'Verify Payment', desc: 'Backend verifies the payment signature using Razorpay webhook or API to confirm capture' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
