import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DialogBuilder } from '../../components/dialog/dialog-builder'
import { EditorContext } from '../../contexts/editor-context'
import { GlobalToast } from '../../services/gloabal-toast'

export const DialogPage: FunctionComponent = () => {
    const { editorManager } = useContext(EditorContext)
    const [dialogUUID, setDialogUUID] = useState<string | null>(null)
    const location = useLocation()
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const dUUID = searchParams.get('dialogUUID')
        setDialogUUID(dUUID || null)
    }, [location])

    useEffect(() => {
        if (!dialogUUID) return
        editorManager.scenarioEngine
            .loadDialog(dialogUUID)
            .then((d) => {
                if (!d.data) editorManager.scenarioEngine.createNewDialog(dialogUUID)
                GlobalToast.toastShow?.('Success', 'Dialog loaded successfully', 'success')
            })
            .catch((err) => {
                console.log(err)
            })
    }, [dialogUUID, editorManager])

    if (!dialogUUID) return <div>Dialog not found</div>
    return (
        <div className="flex h-full w-full flex-col ">
            <DialogBuilder dialogId={dialogUUID}></DialogBuilder>
        </div>
    )
}
