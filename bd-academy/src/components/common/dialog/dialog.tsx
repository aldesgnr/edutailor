// Create react function component for dialog with custom backdrop, event handler and children, and export it, custom title, and custom content, without any ux ui library dependencies.
// Path: bd-academy/src/components/common/dialog/dialog.tsx

import React, { FunctionComponent, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
// import { Button } from 'primereact/button'

export type DialogCustomProps = {
    children: any
    open: boolean
    onClose: (type: string) => void
    title: string
}
export const DialogCustom: FunctionComponent<DialogCustomProps> = ({ children, open, onClose, title }) => {
    const [isModalOpen, setVisible] = React.useState<boolean>(false)

    useEffect(() => {
        setVisible(open)
    }, [open])
    // const footerContent = (
    //     <div>
    //         {/* <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
    //         <Button label="Yes" icon="pi pi-check" onClick={() => setVisible(false)} autoFocus /> */}
    //     </div>
    // )

    return (
        <Dialog
            header={title}
            visible={isModalOpen ? true : false}
            style={{ width: '50vw' }}
            onHide={() => {
                setVisible(false)
                onClose('close')
            }}
            closeOnEscape={false}
            closable={false}
            draggable={false}
            pt={{
                root: {
                    className: 'bg-[var(--content)] ',
                },
                header: {
                    className: 'bg-transparent ',
                },
                content: {
                    className: 'bg-transparent ',
                },
            }}
        >
            <div className="m-0 flex gap-[16px] flex-col">{children}</div>
        </Dialog>
    )
}
