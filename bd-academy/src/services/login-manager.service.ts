import { BehaviorSubject, Subject } from 'rxjs'
import { AuthService, LoginFormFields } from './auth.service'

class LoginManager {
    isLoggedIn: boolean | undefined
    inited = new BehaviorSubject(false)
    loggedOut = new Subject<void>()

    constructor() {
        if (TokenManager.accessToken) {
            this.isLoggedIn = true
            this.inited.next(true)
        } else {
            this.isLoggedIn = false
            this.inited.next(true)
        }
    }

    async login(data: LoginFormFields, rememberMe: boolean) {
        try {
            console.log('[LoginManager] Attempting login...', { email: data.email })
            const responseLogin = await AuthService.loginRequest(data)
            console.log('[LoginManager] Login response:', responseLogin.data)
            
            if (!responseLogin.data.accessToken) {
                console.error('[LoginManager] No accessToken in response!', responseLogin.data)
                throw new Error('No access token received')
            }
            
            TokenManager.setAccessToken(responseLogin.data.accessToken, rememberMe)
            this.isLoggedIn = true
            this.inited.next(true)
            console.log('[LoginManager] Login successful!')
        } catch (error: any) {
            console.error('[LoginManager] Login failed:', error)
            if (error?.response?.status === 401) {
                this.isLoggedIn = false
            }
            throw error
        }
    }

    logout(skipEmittingEvent = false) {
        TokenManager.removeTokens()
        this.isLoggedIn = false
        if (!skipEmittingEvent) this.loggedOut.next()
    }
}
class TokenManager {
    static get accessToken() {
        return localStorage.getItem('user_token') || sessionStorage.getItem('user_token')
    }

    static setAccessToken(token: string, persistent: boolean) {
        if (persistent) localStorage.setItem('user_token', token)
        else sessionStorage.setItem('user_token', token)
    }

    static removeTokens() {
        localStorage.removeItem('user_token')
        sessionStorage.removeItem('user_token')
    }
}

export const loginManager = new LoginManager()
