import Login from './components/login.jsx'
import { AuthProvider } from './auth/AuthContext'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {
  return (
    <>
      <AuthProvider>
        <div>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadReport /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ViewReports /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </>
  )
}

export default App
