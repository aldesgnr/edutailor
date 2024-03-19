import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { appConfig } from '../../app.config'
import { InfinityLoader } from '../../components/common/infinity-loader/infinity-loader'
import { EditorContext } from '../../contexts/editor-context'

import { TrainingScene } from '../../lib/editor-manager/editor.types'
import { PrimaryButton } from '../common/primary-button/primary-button'
import { PrimeIcons } from 'primereact/api'
import { GlobalToast } from '../../services/gloabal-toast'

export type ViewerComponentProps = { trainingSceneUUID: string | null; autostart?: boolean; onErrorLoading?: (e: any) => void }
export const ViewerComponent: FunctionComponent<ViewerComponentProps> = ({ trainingSceneUUID: sceneUUID, autostart = false, onErrorLoading }) => {
    const { viewerManager } = useContext(EditorContext)

    const [interactionIcon, setInteractionIcon] = useState<boolean>(false)
    const [vrSupported, setVRSupported] = useState<boolean>(false)
    const [vrAvailable, setVRAvailable] = useState<boolean>(false)
    const [vrActive, setVRActive] = useState<boolean>(false)
    const [progressValue, setProgressValue] = useState<number>(0)
    const [trainingScene, setTrainingScene] = useState<TrainingScene | null>(null)
    const [trainingSceneUUID, setTrainingSceneUUID] = useState<string | null>(null)
    const [viewerInitialized, setViewerInitialized] = useState<boolean>(false)
    const [viewerApplicationStarted, setViewerApplicationStarted] = useState<boolean>(false)
    const [trainingSceneStarted, setTrainingSceneStarted] = useState<boolean>(false)
    const [loadingStepInfo, setLoadingStepInfo] = useState<string>('Loading configuration')
    const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(null)
    const [debugToolsContainer, setDebugToolsContainer] = useState<HTMLDivElement | null>(null)
    const [trainingSceneError, setTrainingSceneError] = useState<string | null>(null)

    useEffect(() => {
        if (sceneUUID === null) return
        setTrainingSceneUUID(sceneUUID)
    }, [sceneUUID])

    useEffect(() => {
        if (viewerManager !== null) {
            const loadingPercent$ = viewerManager.loadingPercent.subscribe((value) => {
                setProgressValue(value)
            })

            const trainingSceneLoaded$ = viewerManager.trainingSceneLoaded.subscribe((training) => {
                setTrainingScene(training)
            })

            const initialized$ = viewerManager.initialized.subscribe((initialized) => {
                setViewerInitialized(initialized)
            })
            const applicationStarted$ = viewerManager.applicationStarted.subscribe((applicationStarted) => {
                setViewerApplicationStarted(applicationStarted)
            })
            const trainingSceneStarted$ = viewerManager.trainingSceneStarted.subscribe((trainingSceneStarted) => {
                setTrainingSceneStarted(trainingSceneStarted)
            })
            const vrSupported$ = viewerManager.vrSupported.subscribe((vrSupported) => {
                setVRSupported(vrSupported)
            })
            const vrActive$ = viewerManager.vrActive.subscribe((vrActive) => {
                setVRActive(vrActive)
            })
            const vrAvailable$ = viewerManager.vrAvailable.subscribe((vrAvailable) => {
                setVRAvailable(vrAvailable)
            })
            return () => {
                loadingPercent$?.unsubscribe()
                trainingSceneLoaded$?.unsubscribe()
                vrActive$?.unsubscribe()
                vrAvailable$?.unsubscribe()
                vrSupported$?.unsubscribe()
                initialized$?.unsubscribe()
                applicationStarted$?.unsubscribe()
                trainingSceneStarted$?.unsubscribe()
            }
        }
        return () => {}
    }, [viewerManager])

    useEffect(() => {
        if (!viewerInitialized) return
        if (!viewerApplicationStarted) return
        if (!trainingSceneUUID) return
        // viewerManager.restartTraining()
        viewerManager.reset()
        setLoadingStepInfo('Loading training configuration')

        // viewerManager.debug = true
        document.body.appendChild(viewerManager.debugTools)

        viewerManager
            .loadTrainingScene(trainingSceneUUID)
            .then((tr) => {
                if (tr.data === null) throw new Error('Training not found')
                const message = 'Training configuration loaded'

                setLoadingStepInfo(message)
                GlobalToast.toastShow?.('Success', message, 'success')
                setInteractionIcon(true)
                if (autostart) {
                    viewerManager.startTraining()
                }
            })
            .catch((err) => {
                GlobalToast.toastShow?.('Error', err.message, 'error')
                setTrainingSceneError(err.message)
                setTrainingScene(null)
                setTrainingSceneStarted(false)
                setInteractionIcon(false)
                onErrorLoading && onErrorLoading(err)
            })
    }, [trainingSceneUUID, viewerInitialized, viewerApplicationStarted])

    useEffect(() => {
        if (!canvasContainer) return

        const viewerCanvas = viewerManager.canvas
        viewerCanvas.style.position = 'relative'
        viewerCanvas.style.maxWidth = '100%'
        viewerCanvas.style.width = '100%'
        viewerCanvas.style.height = '100%'
        viewerCanvas.style.maxHeight = '100%'
        viewerCanvas.style.minWidth = '100px'
        viewerCanvas.style.minHeight = '100px'
        viewerCanvas.style.display = 'block'
        viewerCanvas.style.backgroundColor = '#4e4e4e'
        canvasContainer.appendChild(viewerCanvas)

        return () => {
            canvasContainer.removeChild(viewerCanvas)
        }
    }, [canvasContainer])

    useEffect(() => {
        if (!debugToolsContainer) return
        if (!viewerManager.debug) return
        const debugTools = viewerManager.debugTools
        debugToolsContainer.append(debugTools)
        return () => {
            console.log(debugToolsContainer, debugTools)
            debugToolsContainer.removeChild(debugTools)
        }
    }, [debugToolsContainer])

    // if (trainingSceneError !== null) {
    //     return (
    //         <div className="flex h-full w-full justify-center items-center flex-col gap-[24px]">
    //             <h1>{trainingSceneError}</h1>
    //             {/* TODO przekazac uuid trainingu glownego */}
    //             {/* <PrimaryButton
    //                 label="Edit training"
    //                 icon={PrimeIcons.ARROW_LEFT}
    //                 onClick={() => navigate(`/trainings/edit?trainingUUID=${uuid}`)}
    //             ></PrimaryButton> */}
    //         </div>
    //     )
    // }

    return (
        <>
            {trainingSceneError && (
                <div className="flex h-full w-full justify-center items-center flex-col gap-[24px] absolute z-[1191]">
                    <h1>{trainingSceneError}</h1>
                </div>
            )}

            {!viewerInitialized && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={'System is loading'}></InfinityLoader>
                </div>
            )}

            {!trainingScene && viewerApplicationStarted && !trainingSceneError && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={'Training is loading'}></InfinityLoader>
                </div>
            )}

            {trainingScene && viewerApplicationStarted && progressValue !== 0 && progressValue !== 1 && (
                <div className="flex h-full w-full absolute z-[1191]">
                    <InfinityLoader text={loadingStepInfo}></InfinityLoader>{' '}
                </div>
            )}

            <div className="flex h-full w-full " onPointerDown={() => trainingSceneStarted && setInteractionIcon(false)}>
                <div id="viewer-canvas" className="w-full h-full">
                    <div
                        className="w-full h-full"
                        ref={(data) => {
                            setCanvasContainer(data)
                        }}
                    ></div>
                    <div
                        className=""
                        ref={(data) => {
                            setDebugToolsContainer(data)
                        }}
                    ></div>
                </div>
                {trainingScene && viewerApplicationStarted && !autostart && !trainingSceneStarted && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: 1190,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f3f3f3b3',
                        }}
                    >
                        <PrimaryButton label={'Start'} icon={PrimeIcons.PLAY} onClick={() => viewerManager.startTraining()}></PrimaryButton>
                    </div>
                )}
                {trainingScene && viewerApplicationStarted && interactionIcon && trainingSceneStarted && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: 1190,
                            left: 'calc(50% - 50px)',
                            top: 'calc(50% - 50px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <img src={`${appConfig().BASE_URL}/3d-rotate.png`} width={100} height={100} />
                    </div>
                )}
                {trainingSceneStarted && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: vrActive ? 9999 + 1 : 1190,
                            right: '0px',
                            bottom: '0px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                            gap: '10px',
                        }}
                    >
                        <PrimaryButton
                            label={'Restart Training'}
                            icon={PrimeIcons.REFRESH}
                            onClick={(e: any) => {
                                e.preventDefault()
                                e.stopPropagation()
                                viewerManager.restartTraining()
                            }}
                        ></PrimaryButton>
                        {vrSupported && vrAvailable && (
                            <>
                                {vrActive ? (
                                    <PrimaryButton
                                        label={'END VR'}
                                        icon={PrimeIcons.PAUSE}
                                        onClick={(e: any) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            viewerManager.endVRTraing()
                                        }}
                                    ></PrimaryButton>
                                ) : (
                                    <PrimaryButton
                                        label={'START VR'}
                                        icon={PrimeIcons.PLAY}
                                        onClick={(e: any) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            viewerManager.startVRTraing()
                                        }}
                                    ></PrimaryButton>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
