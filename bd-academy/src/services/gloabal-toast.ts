export const GlobalToast: {
    toastShow?: (title: string, message: string, severity: 'success' | 'info' | 'warn' | 'error' | undefined) => void
    toastClear?: () => void
} = {}
