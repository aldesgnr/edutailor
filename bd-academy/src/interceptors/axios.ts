import axios from 'axios'
import { appConfig } from '../app.config'
import { GlobalToast } from '../services/gloabal-toast'

const axiosInstance = axios.create({
    baseURL: appConfig().BASE_URL,
})

axiosInstance.interceptors.request.use((config) => {
    if (config.url?.includes('static')) {
        config.baseURL = appConfig().STATIC_URL
    }
    if (config.url?.includes('.json')) {
        config.headers['Content-Type'] = 'application/json'
    }
    return config
})

axiosInstance.interceptors.request.use((config) => {
    if (config.url?.includes('api')) {
        config.baseURL = appConfig().API_URL
    }
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
