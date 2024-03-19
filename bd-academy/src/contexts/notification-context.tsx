import { Toast } from 'primereact/toast'
import React, { ReactElement, createContext, useCallback, useMemo, useRef } from 'react'
import { GlobalToast } from '../services/gloabal-toast'
interface NotificationContextState {
    toastShow: (title: string, message: string, severity: 'success' | 'info' | 'warn' | 'error' | undefined) => void
    toastClear: () => void
}

const defaultNotificationContextState = {
    toastShow: () => void 0,
    toastClear: () => void 0,
}
const NotificationContext = createContext<NotificationContextState>(defaultNotificationContextState)
const NotificationProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const toast = useRef<Toast | null>(null)
    const toastShow = useCallback(
        (title: string, message: string, severity: 'success' | 'info' | 'warn' | 'error' | undefined) => {
            if (!toast.current) return
            if (!toast.current.getElement()) return
            if (toast.current.getElement().children[0]?.childNodes?.length > 2) {
                // toast.current.clear()
            }
            toast.current.show({ severity: severity, summary: title, detail: message, sticky: true })
        },
        [toast],
    )

    const toastClear = useCallback(() => {
        if (!toast.current) return
        toast.current.clear()
    }, [toast])

    const contextValue = useMemo(
        () => ({
            toastShow,
            toastClear,
        }),
        [toastClear, toastShow],
    )

    GlobalToast.toastShow = toastShow
    GlobalToast.toastClear = toastClear

    return (
        <NotificationContext.Provider value={contextValue}>
            <Toast ref={toast} />
            {children}
        </NotificationContext.Provider>
    )
}

export { NotificationProvider, NotificationContext }
