import { PrimeIcons } from 'primereact/api'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Password } from 'primereact/password'
import { classNames } from 'primereact/utils'
import { FunctionComponent, useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { AuthService, ResetPasswordFields } from '../../services/auth.service'
import './new-password.css'
import { GlobalToast } from '../../services/gloabal-toast'

export type NewPasswordPageProps = {}
export type NewPasswordFormFields = {
    password: string
    confirmPassword: string
}
export const NewPasswordPage: FunctionComponent<NewPasswordPageProps> = ({}) => {
    const navigate = useNavigate()
    const [termsAndConditions, setTermsAndConditions] = useState(false)

    const defaultValues: NewPasswordFormFields = {
        password: '',
        confirmPassword: '',
    }

    const {
        control,
        formState: { errors },
        handleSubmit,
        // getValues,
        reset,
    } = useForm({ defaultValues })

    const onSubmit = (data: NewPasswordFormFields) => {
        if (data.password !== data.confirmPassword) return alert('Password and confirm password must be the same')
        const resetData: ResetPasswordFields = {
            email: '',
            password: data.password,
            token: '',
        }
        AuthService.resetPasswordRequest(resetData)
            .then(() => {
                navigate('/dashboard')
                reset()
            })
            .catch((error) => {
                GlobalToast.toastShow?.('Error', error.message, 'error')
            })
    }

    const getFormErrorMessage = (name: keyof NewPasswordFormFields) => {
        return errors[name] ? <small className="p-error">{errors[name]?.message}</small> : <small className="p-error">&nbsp;</small>
    }
    return (
        <div className={'register'}>
            <h1>Sign up</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <Controller
                    name="password"
                    control={control}
                    rules={{ required: 'Password is required' }}
                    render={({ field, fieldState }) => (
                        <>
                            <label htmlFor={field.name} className={classNames({ 'p-error': errors.password })}></label>
                            <span className="p-float-label">
                                <Password
                                    id={field.name}
                                    value={field.value}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                                <label htmlFor={field.name}>Password</label>
                            </span>
                            {getFormErrorMessage(field.name)}
                        </>
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{ required: 'Password is different' }}
                    render={({ field, fieldState }) => (
                        <>
                            <label htmlFor={field.name} className={classNames({ 'p-error': errors.confirmPassword })}></label>
                            <span className="p-float-label">
                                <Password
                                    id={field.name}
                                    value={field.value}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                                <label htmlFor={field.name}>Confirm password</label>
                            </span>
                            {getFormErrorMessage(field.name)}
                        </>
                    )}
                />
                <div className="flex align-items-center">
                    <Checkbox id="termsAndConditions" onChange={(e) => setTermsAndConditions(e.target.value)} checked={termsAndConditions}></Checkbox>
                    <label className={'cursor-pointer ml-2'} htmlFor="termsAndConditions" onClick={() => setTermsAndConditions(!termsAndConditions)}>
                        Accept Terms and Conditions
                    </label>
                </div>
                <Button label="Sign up" type="submit" />
                <p className={'text-center'}>Sing up with</p>
                <div className="register-platforms">
                    <Button label="Google" icon={PrimeIcons.GOOGLE} />
                    <Button label="Facebook" icon={PrimeIcons.FACEBOOK} />
                </div>

                <p>
                    Already have an account?{' '}
                    <span className={'cursor-pointer'} onClick={() => navigate('/auth/login')}>
                        Sign in
                    </span>
                </p>
            </form>
        </div>
    )
}
