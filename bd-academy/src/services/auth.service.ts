import { http } from '../interceptors/axios'

export type LoginFormFields = {
    email: string
    password: string
}
export type RegisterFormFields = {
    email: string
    password: string
    passwordRepeat: string
    serviceAgreementText: boolean | undefined
    newsletter: boolean | undefined
    referralCodeCheck: boolean
    referralCode?: string
}

export type ForgotPasswordFields = { email: string }

export type ResetPasswordFields = { email: string | null; password: string; token: string | null }

export class AuthService {
    static loginRequest = (data: LoginFormFields) => {
        return http.post<{
            accessToken: string
            accountSetupStatus: string
        }>('/auth/login', {
            email: data.email,
            password: data.password,
        })
    }

    static registerRequest = (data: RegisterFormFields, locale: string, serviceAgreementText: string, recaptchaToken: string, referralCode?: string) => {
        return http.post<void>('/auth/register', {
            email: data.email,
            locale: locale,
            password: data.password,
            username: data.email,
            serviceAgreementText: serviceAgreementText,
            recaptchaToken,
            referralCode,
        })
    }

    static forgotPasswordRequest = (data: ForgotPasswordFields) => {
        return http.post<void>('/auth/forgot-password', {
            email: data.email,
        })
    }

    static resetPasswordRequest = (data: ResetPasswordFields) => {
        return http.post<void>('/auth/reset-password', {
            email: data.email,
            newPassword: data.password,
            token: data.token,
        })
    }

    static changePassword = (oldPassword: string, newPassword: string) => {
        return http.post<void>(`/auth/change-password`, { oldPassword: oldPassword, newPassword: newPassword })
    }
}
