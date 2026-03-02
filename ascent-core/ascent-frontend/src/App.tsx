import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProjectListPage from './pages/ProjectListPage'
import DashboardPage from './pages/DashboardPage'
import SplashScreen from './components/SplashScreen'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />
            <Route path="/projects/:projectId/*" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App