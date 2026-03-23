import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!['ADMIN', 'TEACHER'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
