import { FunctionComponent } from 'react'
import { Outlet } from 'react-router-dom'
import './auth-layout.css'

export type AuthLayoutProps = {}

export const AuthLayout: FunctionComponent<AuthLayoutProps> = () => {
    return (
        <div className={'auth-layout flex flex-row h-full w-full'}>
            <div className={'flex  w-full  justify-center items-center'}></div>
            <div className={'flex  w-full justify-center items-center'}>
                <Outlet />
            </div>
        </div>
    )
}
