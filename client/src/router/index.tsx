import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'

// Layouts
import MainLayout from '../components/layouts/MainLayout'
import AdminLayout from '../components/layouts/AdminLayout'

// Guards
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminRoute from '../components/common/AdminRoute'

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-svh">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Public pages (lazy)
const Home         = lazy(() => import('../pages/public/Home'))
const Contests     = lazy(() => import('../pages/public/Contests'))
const ContestDetail= lazy(() => import('../pages/public/ContestDetail'))
const Leaderboard  = lazy(() => import('../pages/public/Leaderboard'))
const Help         = lazy(() => import('../pages/public/Help'))

// Auth pages
const Login        = lazy(() => import('../pages/auth/Login'))
const Register     = lazy(() => import('../pages/auth/Register'))
const ForgotPw     = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPw      = lazy(() => import('../pages/auth/ResetPassword'))

// User pages (protected)
const Dashboard    = lazy(() => import('../pages/user/Dashboard'))
const ProblemSolve = lazy(() => import('../pages/user/ProblemSolve'))
const Profile      = lazy(() => import('../pages/user/Profile'))

// Admin pages
const AdminDashboard   = lazy(() => import('../pages/admin/AdminDashboard'))
const ManageContests   = lazy(() => import('../pages/admin/ManageContests'))
const ContestForm      = lazy(() => import('../pages/admin/ContestForm'))
const ProblemBank      = lazy(() => import('../pages/admin/ProblemBank'))
const ManageUsers      = lazy(() => import('../pages/admin/ManageUsers'))
const SubmissionsReview= lazy(() => import('../pages/admin/SubmissionsReview'))

export default function AppRouter() {
  const { isLoading } = useAuth()
  if (isLoading) return <PageLoader />

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/"                    element={<Home />} />
          <Route path="/contests"            element={<Contests />} />
          <Route path="/contests/:id"        element={<ContestDetail />} />
          <Route path="/leaderboard"         element={<Leaderboard />} />
          <Route path="/help"                element={<Help />} />
          <Route path="/profile/:username"   element={<Profile />} />
        </Route>

        {/* Auth routes (no layout) */}
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password"element={<ForgotPw />} />
        <Route path="/reset-password" element={<ResetPw />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/contests/:id/problems/:problemId"
              element={<ProblemSolve />}
            />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"             element={<AdminDashboard />} />
            <Route path="/admin/contests"    element={<ManageContests />} />
            <Route path="/admin/contests/new"element={<ContestForm />} />
            <Route path="/admin/contests/:id/edit" element={<ContestForm />} />
            <Route path="/admin/problems"    element={<ProblemBank />} />
            <Route path="/admin/users"       element={<ManageUsers />} />
            <Route path="/admin/submissions" element={<SubmissionsReview />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
