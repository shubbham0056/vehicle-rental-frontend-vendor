import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import VendorLayout from './layouts/VendorLayout'
import Login from './pages/Login'
import Dashboard from './pages/vendor/Dashboard'
import Vehicles from './pages/vendor/Vehicles'
import Bookings from './pages/vendor/Bookings'
import Users from './pages/vendor/Users'
import Chat from './pages/vendor/Chat'
import Reports from './pages/vendor/Reports'
import Feedback from './pages/vendor/Feedback'
import Transactions from './pages/vendor/Transactions'
import Payment from './pages/vendor/Payment'
import NearbyMap from './pages/vendor/NearbyMap'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/vendor" replace /> : <Login />} />
      <Route path="/vendor" element={<ProtectedRoute><VendorLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="users" element={<Users />} />
        <Route path="chat" element={<Chat />} />
        <Route path="reports" element={<Reports />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="payment" element={<Payment />} />
        <Route path="map" element={<NearbyMap />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
