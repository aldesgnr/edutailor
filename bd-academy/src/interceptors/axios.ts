import axios from 'axios'
import { appConfig } from '../app.config'
import { GlobalToast } from '../services/gloabal-toast'

const axiosInstance = axios.create({
    baseURL: appConfig().BASE_URL,
})

axiosInstance.interceptors.request.use((config) => {
    // Order matters! Check most specific first
    
    // 1. API requests: /auth/* or /api/*
    if (config.url?.includes('api') || config.url?.includes('auth')) {
        config.baseURL = appConfig().API_URL
        // Add JWT token to API requests (except login/register)
        const token = localStorage.getItem('user_token') || sessionStorage.getItem('user_token')
        if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    // 2. Static requests: /static/*
    else if (config.url?.includes('static')) {
        config.baseURL = appConfig().STATIC_URL
    }
    
    // Set JSON content type for all .json requests
    if (config.url?.includes('.json')) {
        config.headers['Content-Type'] = 'application/json'
    }
    
    console.log('[Axios] Request:', config.method?.toUpperCase(), config.url, 'baseURL:', config.baseURL)
    return config
})
axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },

    (error) => {
        if (error.message === 'Network Error') {
            if (navigator.onLine) {
                GlobalToast.toastShow?.('Network Error', 'Service unavailable', 'error')
            } else {
                GlobalToast.toastShow?.('Network Error', 'Please check internet connection', 'error')
            }
        } else if (error?.response?.status) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - token expired or invalid
                    localStorage.removeItem('user_token')
                    sessionStorage.removeItem('user_token')
                    if (!window.location.pathname.includes('/auth/')) {
                        GlobalToast.toastShow?.('Session Expired', 'Please login again', 'warn')
                        window.location.href = '/auth/login'
                    }
                    break
                case 403:
                    GlobalToast.toastShow?.('Access Denied', 'You don\'t have permission', 'error')
                    break
                case 500:
                case 502:
                case 503:
                    GlobalToast.toastShow?.('Network Error', 'Service unavailable', 'error')
                    break
                default: {
                    if (error.response.status >= 500) {
                        GlobalToast.toastShow?.('Network Error', 'Service unavailable', 'error')
                    }
                    break
                }
            }
        }

        return Promise.reject(error)
    },
)
export { axiosInstance as http }
