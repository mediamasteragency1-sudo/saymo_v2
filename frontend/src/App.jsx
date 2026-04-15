import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'
import Navbar from './components/common/Navbar'
import PrivateRoute from './components/common/PrivateRoute'

// Public pages
import Home from './pages/public/Home'
import Listings from './pages/public/Listings'
import PropertyDetail from './pages/public/PropertyDetail'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

// User pages
import Dashboard from './pages/user/Dashboard'
import Profile from './pages/user/Profile'
import PsychTest from './pages/user/PsychTest'
import Recommendations from './pages/user/Recommendations'
import Favorites from './pages/user/Favorites'
import Bookings from './pages/user/Bookings'

// User pages (detail)
import BookingDetail from './pages/user/BookingDetail'
import Messages from './pages/Messages'

// Host pages
import HostDashboard from './pages/host/HostDashboard'
import HostProperties from './pages/host/HostProperties'
import HostPropertyForm from './pages/host/HostPropertyForm'
import HostBookings from './pages/host/HostBookings'
import HostReviews from './pages/host/HostReviews'
import HostAvailability from './pages/host/HostAvailability'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProperties from './pages/admin/AdminProperties'
import AdminReports from './pages/admin/AdminReports'

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/test" element={<PrivateRoute><PsychTest /></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
        <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/bookings/:id" element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:bookingId" element={<PrivateRoute><Messages /></PrivateRoute>} />

        {/* Host */}
        <Route path="/host/dashboard" element={<PrivateRoute roles={['host', 'admin']}><HostDashboard /></PrivateRoute>} />
        <Route path="/host/properties" element={<PrivateRoute roles={['host', 'admin']}><HostProperties /></PrivateRoute>} />
        <Route path="/host/properties/new" element={<PrivateRoute roles={['host', 'admin']}><HostPropertyForm /></PrivateRoute>} />
        <Route path="/host/properties/:id/edit" element={<PrivateRoute roles={['host', 'admin']}><HostPropertyForm /></PrivateRoute>} />
        <Route path="/host/properties/:id/availability" element={<PrivateRoute roles={['host', 'admin']}><HostAvailability /></PrivateRoute>} />
        <Route path="/host/bookings" element={<PrivateRoute roles={['host', 'admin']}><HostBookings /></PrivateRoute>} />
        <Route path="/host/reviews" element={<PrivateRoute roles={['host', 'admin']}><HostReviews /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/properties" element={<PrivateRoute roles={['admin']}><AdminProperties /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '120px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 80, marginBottom: 16 }}>404</h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>Page introuvable</p>
            <a href="/" className="btn btn-primary">Retour à l'accueil</a>
          </div>
        } />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <AppRoutes />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
