import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { loginManager } from '../services/login-manager.service'

export const ProtectedRoute = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const loggedOut$ = loginManager.loggedOut.subscribe(() => {
            navigate('/auth/login', { state: location.pathname + location.search })
        })
        return () => {
            loggedOut$.unsubscribe()
        }
    }, [navigate, location])

    if (!loginManager.isLoggedIn) {
        return <Navigate to="/auth/login" state={location.pathname + location.search} replace />
    }

    return <Outlet />
}

export const UnProtectedRoute = () => {
    if (loginManager.isLoggedIn) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
