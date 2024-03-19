import { FunctionComponent, useContext, useEffect, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { EditorComponent } from '../../components/editor/editor.component'
import { EditorContext } from '../../contexts/editor-context'

import './editor.page.css'
import { GlobalToast } from '../../services/gloabal-toast'
import { TrainingScene } from '../../lib/editor-manager/editor.types'

export const EditorPage: FunctionComponent = () => {
    const { editorManager } = useContext(EditorContext)

    const [trainingSceneUUID, setTrainingSceneUUID] = useState<string | null>(null)
    const [progressValue, setProgressValue] = useState<number>(0)
    const [editorInitialized, setEditorInitialized] = useState<boolean>(false)
    const [trainingScene, setTrainingScene] = useState<TrainingScene | null>(null)
    const [trainingSceneStarted, setTrainingSceneStarted] = useState<boolean>(false)
    const [editorApplicationStarted, setEditorApplicationStarted] = useState<boolean>(false)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const trScUUID = searchParams.get('trainingSceneUUID')
        setTrainingSceneUUID(trScUUID || null)
        if (trScUUID === null) {
            navigate('/trainings')
            GlobalToast.toastShow?.('Error', 'No training selected', 'error')
        }
    }, [location])

    useEffect(() => {
        return () => {
            if (editorManager.applicationStarted.value) {
                editorManager.reset()
            }
        }
    }, [location, editorManager.applicationStarted.value])

    useEffect(() => {
        const loadingPercent$ = editorManager.loadingPercent.subscribe((value) => {
            setProgressValue(value)
        })

        const trainingSceneLoaded$ = editorManager.trainingSceneLoaded.subscribe((training) => {
            setTrainingScene(training)
        })

        const initialized$ = editorManager.initialized.subscribe((initialized) => {
            setEditorInitialized(initialized)
        })

        const applicationStarted$ = editorManager.applicationStarted.subscribe((applicationStarted) => {
            setEditorApplicationStarted(applicationStarted)
        })
        const trainingSceneStarted$ = editorManager.trainingSceneStarted.subscribe((trainingSceneStarted) => {
            setTrainingSceneStarted(trainingSceneStarted)
        })

        return () => {
            loadingPercent$?.unsubscribe()
            initialized$?.unsubscribe()
            trainingSceneLoaded$?.unsubscribe()
            applicationStarted$?.unsubscribe()
            trainingSceneStarted$?.unsubscribe()
        }
    }, [editorManager])

    useEffect(() => {
        if (!editorInitialized) return
        if (!editorApplicationStarted) return
        if (!trainingSceneUUID) return
        // editorManager.restartTraining()
        editorManager
            .loadTrainingScene(trainingSceneUUID)
            .then(async (tr) => {
                let message = 'Training scene configuration loaded'
                GlobalToast.toastShow?.('Success', message, 'success')
                if (tr.data === null) {
                    message = 'Training scene configuration created'
                    GlobalToast.toastShow?.('Error', message, 'error')
                }
                // setLoadingStepInfo(message)
            })
            .catch((err) => {
                GlobalToast.toastShow?.('Error', err.message, 'error')
                // setTrainingSceneError(err.message)
            })
    }, [trainingSceneUUID, editorInitialized, editorApplicationStarted])

    return (
        <div className="flex h-full w-full flex-col ">
            <EditorComponent trainingSceneUUID={trainingSceneUUID}></EditorComponent>
        </div>
    )
}
