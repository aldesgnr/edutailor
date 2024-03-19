// function component named engine.component.tsx
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { EditorContext } from '../../contexts/editor-context'
import { TrainingScene } from '../../lib/editor-manager/editor.types'
import { InfinityLoader } from '../common/infinity-loader/infinity-loader'
import { EditorCanvas } from './canvas/editor-canvas.component'
import { EditorRightPanel } from './right-panel/right-panel'
export type EditorComponentProps = { trainingSceneUUID: string | null }
export const EditorComponent: FunctionComponent<EditorComponentProps> = ({ trainingSceneUUID: sceneUUID }) => {
    const { editorManager } = useContext(EditorContext)

    const [progressValue, setProgressValue] = useState<number>(0)
    const [trainingScene, setTrainingScene] = useState<TrainingScene | null>(null)
    const [trainingSceneStarted, setTrainingSceneStarted] = useState<boolean>(false)
    const [trainingSceneUUID, setTrainingSceneUUID] = useState<string | null>(null)
    const [editorInitialized, setEditorInitialized] = useState<boolean>(false)
    const [editorApplicationStarted, setEditorApplicationStarted] = useState<boolean>(false)
    const [loadingStepInfo] = useState<string>('Loading VR Training content')

    useEffect(() => {
        if (sceneUUID === null) return
        setTrainingSceneUUID(sceneUUID)
    }, [sceneUUID])

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

    return (
        <div className="flex h-full w-full flex-row relative">
            {!editorInitialized && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={'System is loading'}></InfinityLoader>
                </div>
            )}

            {!trainingScene && editorApplicationStarted && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={'Training is loading'}></InfinityLoader>
                </div>
            )}

            {trainingScene && editorApplicationStarted && progressValue !== 0 && progressValue !== 1 && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={loadingStepInfo}></InfinityLoader>
                </div>
            )}

            <EditorCanvas></EditorCanvas>
            <EditorRightPanel></EditorRightPanel>
        </div>
    )
}
