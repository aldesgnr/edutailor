//create react component function

import { PrimeIcons } from 'primereact/api'
import { Panel } from 'primereact/panel'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { EditorContext } from '../../contexts/editor-context'
import { TrainingContext } from '../../contexts/training-context'
import { Scene, TrainingScene } from '../../lib/editor-manager/editor.types'
import { GlobalToast } from '../../services/gloabal-toast'
import { DialogCustom } from '../common/dialog/dialog'
import { PrimaryButton } from '../common/primary-button/primary-button'
import { SecondaryButton } from '../common/secondary-button/secondary-button'
import { DialogBuilder } from '../dialog/dialog-builder'
import { EditorComponent } from '../editor'
import { HomePath, ScriptSceneBredcrumbComponent } from './script-scene-bredcrumb'
import { TrainingSectionComponent } from './script-section-component-card'
import { appConfig } from '../../app.config'
import { t } from 'i18next'

export enum EditorRightPanelTabs {
    SCENE = 'SCENE',
    SCRIPT = 'SCRIPT',
}
export type ScriptSceneEditorComponentProps = {
    sceneTemplate: Scene | null
    scriptComponent: TrainingSectionComponent
    onClickSaveScene?: () => void
    onClickCloseScene?: () => void
}

export const ScriptSceneEditorComponent: FunctionComponent<ScriptSceneEditorComponentProps> = ({
    sceneTemplate,
    scriptComponent,
    onClickCloseScene,
    onClickSaveScene,
}) => {
    // const [sceneToEdit, setSceneToEdit] = useState<Scene | null>(null)
    const { editorManager } = useContext(EditorContext)
    const { trainingData, trainingScriptSectionToEdit, updateTrainingData } = useContext(TrainingContext)
    const [avtiveTab, setActiveTab] = useState<EditorRightPanelTabs>(EditorRightPanelTabs.SCENE)
    const [maximized, setMaximized] = useState<boolean>(false)
    const [maximizeContent, setMaximizeContent] = useState<Element | null>(null)
    const [showSaveChangesDialog, setShowDialogSaveSceneChanges] = useState<boolean>(false)
    const [showDialogSaveScriptChanges, setShowDialogSaveScriptChanges] = useState<boolean>(false)
    const [trainingScriptComponent, setTrainingScriptComponent] = useState<TrainingSectionComponent | null>(null)
    const [editorInitialized, setEditorInitialized] = useState<boolean>(false)
    const [editorApplicationStarted, setEditorApplicationStarted] = useState<boolean>(false)
    const [trainingScene, setTrainingScene] = useState<TrainingScene | null>(null)
    const [breadCrumbHome, setBreadCrumbHome] = useState<HomePath>({
        icon: PrimeIcons.WINDOW_MAXIMIZE,
        url: '/trainings',
        title: 'Trainings:',
        subtitle: 'w to conduct a patient inter',
        template: null,
    })
    const [breadCrumbItems, setBreadCrumbItems] = useState<HomePath[]>([])
    // const [loadingStepInfo, setLoadingStepInfo] = useState<string>('Loading configuration')

    // useEffect(() => {
    //     if (!scene) return
    //     setSceneToEdit(scene)
    // }, [scene])
    useEffect(() => {
        if (avtiveTab === EditorRightPanelTabs.SCENE) {
            setTimeout(() => {
                editorManager.resetScripts()
            }, 100)
        }
    }, [avtiveTab])

    useEffect(() => {
        if (!scriptComponent) return
        setTrainingScriptComponent(scriptComponent)
    }, [scriptComponent])

    useEffect(() => {
        const checkMaximized = () => {
            const max = document.fullscreen !== null ? document.fullscreen : false
            setMaximized(max)
        }

        const root = document.querySelector('.app-layout')
        if (!root) return
        setMaximizeContent(root)
        checkMaximized()

        root.addEventListener('fullscreenchange', checkMaximized)

        checkMaximized()
        return () => {
            maximizeContent?.removeEventListener('fullscreenchange', checkMaximized)
        }
    }, [document])

    useEffect(() => {
        const trainingSceneLoaded$ = editorManager.trainingSceneLoaded.subscribe((trainingScene) => {
            setTrainingScene(trainingScene)
        })

        const initialized$ = editorManager.initialized.subscribe((initialized) => {
            setEditorInitialized(initialized)
        })

        const applicationStarted$ = editorManager.applicationStarted.subscribe((applicationStarted) => {
            setEditorApplicationStarted(applicationStarted)
        })

        return () => {
            initialized$?.unsubscribe()
            trainingSceneLoaded$?.unsubscribe()
            applicationStarted$?.unsubscribe()
        }
    }, [editorManager])

    useEffect(() => {
        if (!editorInitialized) return
        if (!editorApplicationStarted) return
        if (!trainingScriptComponent)
            return // editorManager.restartTraining()
            // setLoadingStepInfo('Loading training scene configuration')
            // editorManager.enableRender = true
        ;(async () => {
            const createdNewTrainingComponents = []
            let resolveP1 = (value: any) => {}
            let resolveP2 = (value: any) => {}
            const p1 = new Promise((resolve) => {
                resolveP1 = resolve
            })
            const p2 = new Promise((resolve) => {
                resolveP2 = resolve
            })
            createdNewTrainingComponents.push(p1)
            createdNewTrainingComponents.push(p2)
            editorManager
                .loadTrainingScene(trainingScriptComponent.id)
                .then(async (tr) => {
                    let message = 'Training scene configuration loaded'
                    if (tr.data === null) {
                        message = 'Training scene configuration created'
                        editorManager.createNewTrainingScene(trainingScriptComponent.id)
                        if (sceneTemplate) {
                            await editorManager.loadPredefinedScene(sceneTemplate)
                        } else {
                            // GlobalToast.toastShow?.('Error', 'sceneTemplateNotFound', 'error')
                            // throw new Error(t('training:sceneTemplateNotFound'))
                        }
                    }
                    // setLoadingStepInfo(message)
                    GlobalToast.toastShow?.('Success', message, 'success')
                    resolveP1(tr.data)
                })
                .catch((err) => {
                    GlobalToast.toastShow?.('Error', err.message, 'error')
                    // setTrainingSceneError(err.message)
                })
            if (trainingScriptComponent.dialogId) {
                editorManager.scenarioEngine
                    .loadDialog(trainingScriptComponent.dialogId)
                    .then((d) => {
                        let message = 'Dialog loaded successfully'
                        if (d.data === null) {
                            message = 'Dialog created successfully'
                            editorManager.scenarioEngine.createNewDialog(trainingScriptComponent.dialogId)
                        }
                        GlobalToast.toastShow?.('Success', message, 'success')
                        resolveP2(d.data)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }

            Promise.all(createdNewTrainingComponents).then(async (values) => {
                if (values[0] === null) {
                    await editorManager.saveScene().then(() => {
                        // console.log('scene saved')
                    })
                }
                if (values[1] === null) {
                    await editorManager.scenarioEngine.saveDialog().then(() => {
                        // console.log('dialog saved')
                    })
                }
            })
        })()
    }, [trainingScriptComponent, editorInitialized, editorApplicationStarted])

    useEffect(() => {
        if (trainingData) {
            setBreadCrumbHome({
                icon: PrimeIcons.WINDOW_MAXIMIZE,
                url: '/trainings',
                title: 'Trainings:',
                subtitle: trainingData.title,
                template: null,
            })
        }
        if (trainingData && trainingScriptComponent) {
            //to refactor
            const ind = trainingData?.trainingSections
                .map((a) => {
                    return a.trainingSectionComponents
                })
                .map((c) =>
                    c.findIndex((b) => {
                        return b.id == trainingScriptComponent.id
                    }),
                )
                .findIndex((a) => {
                    return a == 0
                })
            const b = []
            if (ind >= 0 && trainingData) {
                b.push({
                    icon: PrimeIcons.DATABASE,
                    url: '',
                    title: 'Section:',
                    subtitle: trainingData.trainingSections[ind].title,
                    template: null,
                })
            }
            b.push({
                icon: PrimeIcons.ARROWS_H,
                url: '',
                title: 'Scene:',
                subtitle: trainingScriptComponent.title,
                template: null,
            })
            setBreadCrumbItems(b)
        }
    }, [trainingScriptComponent, trainingData, trainingScriptSectionToEdit])

    const onClickPreviewScene = () => {
        updateTrainingData(trainingData, true, true).then(() => {
            Promise.all([editorManager.saveScene(), editorManager.scenarioEngine.saveDialog()])
                .then(async (values) => {
                    window.open(`${appConfig().BASE_URL}/viewer?trainingSceneUUID=${editorManager.trainingSceneUUID}`, '_blank', 'noreferrer')
                })
                .catch((err) => {
                    GlobalToast.toastShow?.('Error', err.message, 'error')
                })
        })
    }

    const saveSceneAndDialog = async () => {
        updateTrainingData(trainingData, true, true).then(() => {
            Promise.all([editorManager.saveScene(), editorManager.scenarioEngine.saveDialog()])
                .then(async (values) => {
                    return 'saved'
                })
                .catch((err) => {
                    throw err
                })
        })
    }
    if (trainingScriptComponent === null) return null
    return (
        <div className={'absolute top-0 left-0 bottom-0 right-0 bg-[var(--content)] h-full py-[16px] z-[1000]'}>
            <div className={'absolute top-[94px] left-[-60px] '}>
                <div className={'flex flex-col max-w-[60px] w-[60px] text-[12px] '}>
                    <div
                        className={`flex flex-row h-[60px] justify-start items-center  w-full gap-[8px] pl-[8px] pr-0 rounded-[8px_0px_0px_8px] cursor-pointer
                        ${
                            avtiveTab === EditorRightPanelTabs.SCENE ? 'bg-[#1D6149] text-[var(--primary)]' : 'bg-[var(--dark-800)]'
                        }  hover:bg-[var(--dark-600)]`}
                        onClick={() => setActiveTab(EditorRightPanelTabs.SCENE)}
                    >
                        <i className={PrimeIcons.ARROWS_V + ' text-[11px]'} />
                        <div className={'text-[11px]'}>Scene</div>
                    </div>
                    <div
                        className={`flex flex-row h-[60px] justify-start items-center  w-full gap-[8px] pl-[8px] pr-0 rounded-[8px_0px_0px_8px] cursor-pointer
                        ${
                            avtiveTab === EditorRightPanelTabs.SCRIPT ? 'bg-[#1D6149] text-[var(--primary)]' : 'bg-[var(--dark-800)]'
                        } hover:bg-[var(--dark-600)]`}
                        onClick={() => setActiveTab(EditorRightPanelTabs.SCRIPT)}
                    >
                        <i className={PrimeIcons.COMMENTS + ' text-[11px]'} />
                        <div className={'text-[11px]'}>Script</div>
                    </div>
                </div>
            </div>

            <Panel
                pt={{
                    root: {
                        className: 'gradient h-full ',
                    },
                    content: {
                        className: 'pt-[0px] h-full pt-[14px]',
                    },
                    toggleableContent: {
                        className: ' h-full',
                    },
                }}
            >
                {avtiveTab === EditorRightPanelTabs.SCENE && (
                    <div className={'flex flex-col gap-[14px] w-full h-full'}>
                        <ScriptSceneBredcrumbComponent
                            home={breadCrumbHome}
                            items={breadCrumbItems}
                            onClickPreviewScene={onClickPreviewScene}
                        ></ScriptSceneBredcrumbComponent>
                        <EditorComponent trainingSceneUUID={trainingScriptComponent.id}></EditorComponent>
                        <div className={'flex flex-row gap-[14px]'}>
                            <SecondaryButton label={'Save scene'} icon={PrimeIcons.SAVE} onClick={() => setShowDialogSaveSceneChanges(true)}></SecondaryButton>
                            <SecondaryButton label={'Close'} icon={PrimeIcons.TIMES} onClick={() => setShowDialogSaveSceneChanges(true)}></SecondaryButton>
                        </div>
                    </div>
                )}

                {avtiveTab === EditorRightPanelTabs.SCRIPT && (
                    <div className={'flex flex-col gap-[14px] w-full h-full'}>
                        <DialogBuilder dialogId={trainingScriptComponent.dialogId}></DialogBuilder>
                        <div className={'flex flex-row gap-[14px]'}>
                            <SecondaryButton
                                label={'Save script'}
                                icon={PrimeIcons.SAVE}
                                onClick={() => setShowDialogSaveScriptChanges(true)}
                            ></SecondaryButton>
                            <SecondaryButton label={'Close'} icon={PrimeIcons.TIMES} onClick={() => setShowDialogSaveScriptChanges(true)}></SecondaryButton>
                        </div>
                    </div>
                )}
            </Panel>

            <DialogCustom open={showSaveChangesDialog} onClose={() => onClickCloseScene} title={'Save changes'}>
                <div className="text-[14px] leading-[14px]">Do you want to save changes to the scene?</div>
                <div className="flex flex-row gap-[14px] justify-end items-center">
                    <SecondaryButton
                        label={'Close'}
                        icon={PrimeIcons.TIMES}
                        onClick={() => {
                            onClickCloseScene && onClickCloseScene()
                            setShowDialogSaveSceneChanges(false)
                        }}
                    ></SecondaryButton>
                    <PrimaryButton
                        label={'Save scene'}
                        icon={PrimeIcons.SAVE}
                        onClick={() => {
                            ;(async () => {
                                setShowDialogSaveSceneChanges(false)

                                saveSceneAndDialog().then((state) => {
                                    GlobalToast.toastShow?.('Success', 'Scene, and dialog saved successfully', 'success')
                                    onClickSaveScene && onClickSaveScene()
                                })
                                // await editorManager
                                //     .saveScene()
                                //     .then(() => {
                                //         onClickSaveScene && onClickSaveScene()
                                //     })
                                //     .catch((err) => {
                                //         console.log(err)
                                //     })
                            })()
                        }}
                    ></PrimaryButton>
                </div>
            </DialogCustom>

            <DialogCustom open={showDialogSaveScriptChanges} onClose={() => onClickCloseScene} title={'Save changes'}>
                <div className="text-[14px] leading-[14px]">Do you want to save changes to the script?</div>
                <div className="flex flex-row gap-[14px] justify-end items-center">
                    <SecondaryButton
                        label={'Close'}
                        icon={PrimeIcons.TIMES}
                        onClick={() => {
                            onClickCloseScene && onClickCloseScene()
                            setShowDialogSaveScriptChanges(false)
                        }}
                    ></SecondaryButton>
                    <PrimaryButton
                        label={'Save script'}
                        icon={PrimeIcons.SAVE}
                        onClick={() => {
                            setShowDialogSaveScriptChanges(false)

                            saveSceneAndDialog().then(() => {
                                GlobalToast.toastShow?.('Success', 'Scene, and dialog saved successfully', 'success')
                                onClickSaveScene && onClickSaveScene()
                            })
                            // ;(async () => {
                            //     await scenarioEngine
                            //         .saveDialog()
                            //         .then(() => {
                            //             onClickSaveScene && onClickSaveScene()
                            //         })
                            //         .catch((err) => {
                            //             console.log(err)
                            //         })
                            // })()
                        }}
                    ></PrimaryButton>
                </div>
            </DialogCustom>
        </div>
    )
}
