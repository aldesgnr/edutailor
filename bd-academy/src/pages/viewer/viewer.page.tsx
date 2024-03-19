import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ViewerComponent } from '../../components/viewer/viewer.component'
import { EditorContext } from '../../contexts/editor-context'

import './viewer.page.css'
import { GlobalToast } from '../../services/gloabal-toast'

export const ViewerPage: FunctionComponent = () => {
    const [trainingSceneUUID, setTrainingSceneUUID] = useState<string | null>(null)
    const { viewerManager } = useContext(EditorContext)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const trUUID = searchParams.get('trainingSceneUUID')
        setTrainingSceneUUID(trUUID || null)
        if (trUUID === null) {
            GlobalToast.toastShow?.('Error', 'No training selected', 'error')
            navigate('/')
        }
        if (!viewerManager.enableRender) viewerManager.enableRender = true
        return () => {
            viewerManager.enableRender = false
        }
    }, [location])

    return (
        <div className="flex h-full w-full ">
            <ViewerComponent trainingSceneUUID={trainingSceneUUID}></ViewerComponent>
        </div>
    )
}
