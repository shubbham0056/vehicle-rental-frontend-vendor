import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationContext'
import {
  LayoutDashboard, Car, CalendarCheck, Users, MessageSquare,
  AlertTriangle, LogOut, Bell, Sun, Moon, Menu, X, ChevronRight,
  Star, CreditCard, Receipt, Map
} from 'lucide-react'

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/vendor', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/vendor/vehicles', icon: Car, label: 'Vehicles' },
      { to: '/vendor/bookings', icon: CalendarCheck, label: 'Bookings' },
      { to: '/vendor/users', icon: Users, label: 'Users & KYC' },
      { to: '/vendor/map', icon: Map, label: 'Fleet Map' },
    ],
  },
  {
    label: 'Customer',
    items: [
      { to: '/vendor/chat', icon: MessageSquare, label: 'Messages' },
      { to: '/vendor/reports', icon: AlertTriangle, label: 'Reports' },
      { to: '/vendor/feedback', icon: Star, label: 'Feedback' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/vendor/payment', icon: CreditCard, label: 'Payments' },
      { to: '/vendor/transactions', icon: Receipt, label: 'Transactions' },
    ],
  },
]

const notifIcons = {
  booking: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  cancellation: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  report: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  kyc: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  payment: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
}

export default function VendorLayout() {
  const { logout, user } = useAuth()
  const { dark, toggle } = useTheme()
  const { notifications, markRead, markAllRead, unread } = useNotifications()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} w-64 bg-slate-900 dark:bg-slate-950 flex-col shrink-0 h-full`}>
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Car size={16} className="text-white" />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">RentWheels</span>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0] ?? 'V'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navSections.map(({ label, items }) => (
          <div key={label}>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-1">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1">{itemLabel}</span>
                      {isActive && <ChevronRight size={14} className="opacity-60" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <button onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all">
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          {/* Dark mode toggle (desktop) */}
          <button onClick={toggle}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(o => !o)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">No notifications</p>
                  )}
                  {notifications.map(n => (
                    <button key={n.id} onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notifIcons[n.type]}`}>
                        {n.type === 'booking' && <CalendarCheck size={14} />}
                        {n.type === 'cancellation' && <X size={14} />}
                        {n.type === 'report' && <AlertTriangle size={14} />}
                        {n.type === 'kyc' && <Users size={14} />}
                        {n.type === 'payment' && <CreditCard size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                          {n.title}
                          {!n.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{n.message}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0] ?? 'V'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
