import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { classNames } from 'primereact/utils'
import { FunctionComponent, useContext } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { AuthService } from '../../services/auth.service'
import './forgot-password.css'
import { GlobalToast } from '../../services/gloabal-toast'

export type ForgotPasswordPageProps = {}
export type ForgotPasswordFormFields = {
    email: string
}
export const ForgotPasswordPage: FunctionComponent<ForgotPasswordPageProps> = ({}) => {
    const navigate = useNavigate()

    const defaultValues: ForgotPasswordFormFields = {
        email: '',
    }

    const {
        control,
        formState: { errors },
        handleSubmit,
        // getValues,
        reset,
    } = useForm({ defaultValues })

    const onSubmit = (data: ForgotPasswordFormFields) => {
        AuthService.forgotPasswordRequest(data)
            .then(() => {
                navigate('/dashboard')
                reset()
            })
            .catch((error) => {
                GlobalToast.toastShow?.('Error', error.message, 'error')
            })
    }

    const getFormErrorMessage = (name: keyof ForgotPasswordFormFields) => {
        return errors[name] ? <small className="p-error">{errors[name]?.message}</small> : <small className="p-error">&nbsp;</small>
    }
    return (
        <div className={'forgot-password'}>
            <h1>Password recovery</h1>
            <h2>Fill the field with e-mail address you use to sign in.</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <Controller
                    name="email"
                    control={control}
                    rules={{ required: 'Email is required' }}
                    render={({ field, fieldState }) => (
                        <>
                            <label htmlFor={field.name} className={classNames({ 'p-error': errors.email })}></label>
                            <span className="p-float-label">
                                <InputText
                                    id={field.name}
                                    value={field.value}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                                <label htmlFor={field.name}>Email</label>
                            </span>
                            {getFormErrorMessage(field.name)}
                        </>
                    )}
                />
                <Button label="Send" type="submit" />

                <p className={'text-center cursor-pointer'}>
                    <span onClick={() => window.history.back()}>Go back</span>
                </p>
            </form>
        </div>
    )
}
