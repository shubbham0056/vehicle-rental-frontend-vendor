import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  const addNotification = (notif) =>
    setNotifications(n => [{ ...notif, id: Date.now(), read: false, time: 'Just now' }, ...n])

  const markRead = (id) =>
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))

  const markAllRead = () =>
    setNotifications(n => n.map(x => ({ ...x, read: true })))

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user?.token) return

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: user.token,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    // Join vendor room to receive payment notifications
    socket.emit('join', user._id)

    socket.on('paymentReceived', (data) => {
      addNotification({
        type:    'payment',
        title:   'Payment Received',
        message: data.message,
      })
    })

    socket.on('bookingCreated', (data) => {
      addNotification({
        type:    'booking',
        title:   'New Booking',
        message: data.message,
      })
    })

    return () => socket.disconnect()
  }, [user?.token])

  return (
    <NotificationContext.Provider value={{ notifications, markRead, markAllRead, addNotification, unread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
