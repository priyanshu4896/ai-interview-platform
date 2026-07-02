import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import InterviewRoom from './pages/InterviewRoom'
import InterviewSetup from './pages/InterviewSetup'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Result from './pages/Result'
import ResumeAnalyzer from './pages/ResumeAnalyzer'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/setup" element={<InterviewSetup />} />
          <Route path="/interview/:id" element={<InterviewRoom />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  )
}
