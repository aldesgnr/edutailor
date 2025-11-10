import { BaseVariant, MaterialDesignContent, SnackbarProvider, useSnackbar } from 'notistack'
import { createRoot } from 'react-dom/client'
import styled from 'styled-components'
let mountPoint = document.querySelector('#notification-service')
if (!mountPoint) {
    mountPoint = document.createElement('div')
}
mountPoint.id = 'notification-service'
document.body.appendChild(mountPoint)

const styledNotistackComponent = styled(MaterialDesignContent)(() => ({
    '&.notistack-MuiContent-success': {
        backgroundColor: 'varr(--success)',
    },
    '&.notistack-MuiContent-error': {
        backgroundColor: 'var(--danger)',
    },
    '&.notistack-MuiContent-info': {
        backgroundColor: 'var(--info)',
    },
    '&.notistack-MuiContent-warning': {
        backgroundColor: 'var(--warning)',
    },
}))

export default {
    success: function (msg: string) {
        this.toast(msg, 'success')
    },
    warning: function (msg: string) {
        this.toast(msg, 'warning')
    },
    info: function (msg: string) {
        this.toast(msg, 'info')
    },
    error: function (msg: string) {
        this.toast(msg, 'error')
    },
    toast: function (msg: string, variant: BaseVariant = 'default') {
        const ShowSnackbar = ({ message }: any) => {
            const { enqueueSnackbar } = useSnackbar()
            enqueueSnackbar(message, { variant })
            return null
        }
        if (mountPoint) {
            const root = createRoot(mountPoint)
            root.render(
                <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                    variant={variant}
                    Components={{
                        success: styledNotistackComponent,
                        error: styledNotistackComponent,
                        warning: styledNotistackComponent,
                        info: styledNotistackComponent,
                    }}
                >
                    <ShowSnackbar message={msg as any} />
                </SnackbarProvider>,
            )
        }
    },
}
