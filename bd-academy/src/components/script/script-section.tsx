//create react component function

import { PrimeIcons } from 'primereact/api'
import { Panel } from 'primereact/panel'
import { FunctionComponent, useContext, useEffect, useRef, useState } from 'react'
import { TrainingContext } from '../../contexts/training-context'
import { Scene } from '../../lib/editor-manager/editor.types'
import { uuidv4 } from '../../services/training/training.service'
import { ActionButton } from '../common/action-button/action-button.component'
import { SecondaryButton } from '../common/secondary-button/secondary-button'
import { ScriptSceneEditorComponent } from './script-scene-editor'
import { ScriptScenePreviewComponent } from './script-scene-preview'
import { ScriptSectionComponentCardComponent, TrainingSectionComponent, TrainingSectionComponentEnum } from './script-section-component-card'
import { ScripscriptSectionComponentTypeSelectorComponent } from './section-component/section-component.component'

export type TrainingScriptSection = {
    id: string
    title: string
    trainingSectionComponents: TrainingSectionComponent[]
}
export type ScriptSectionComponentProps = {
    scriptSection: TrainingScriptSection
    number: number
    onClickEdit: (scriptSection: TrainingScriptSection) => void
    onClickDelete: (scriptSection: TrainingScriptSection) => void
}

export const ScriptSectionComponent: FunctionComponent<ScriptSectionComponentProps> = ({ number = 1, scriptSection, onClickEdit, onClickDelete }) => {
    const { trainingData, updateTrainingData, setTrainingScriptSectionToEdit } = useContext(TrainingContext)
    const [collapsed, setCollapsed] = useState<boolean>(false)
    const [editScriptComponentType, setAddScriptComponentType] = useState<TrainingSectionComponentEnum | null>(null)
    const [activeScriptSection, setActiveScriptSection] = useState<TrainingScriptSection | null>(null)
    const [scriptComponents, setScriptComponents] = useState<TrainingSectionComponent[]>([])
    const [sceneTrainingSectionComponentToEdit, setSceneTrainingSectionComponentToEdit] = useState<TrainingSectionComponent | null>(null)
    const [sceneToPreview, setSceneToPreview] = useState<Scene | null>(null)
    const [sceneToEdit, setSceneToEdit] = useState<Scene | null>(null)
    const root = useRef(null)

    useEffect(() => {
        if (trainingData === null) return
        if (activeScriptSection === null) return
        const scriptSectionIdx = trainingData.trainingSections.findIndex((section) => section.id === activeScriptSection.id)
        if (scriptSectionIdx !== -1) {
            trainingData.trainingSections[scriptSectionIdx].trainingSectionComponents = scriptComponents
            updateTrainingData(trainingData, true, false)
        }
    }, [scriptComponents])

    useEffect(() => {
        setTrainingScriptSectionToEdit(activeScriptSection)
        if (activeScriptSection === null) return
        setScriptComponents(activeScriptSection.trainingSectionComponents)
    }, [activeScriptSection])

    useEffect(() => {
        if (scriptSection === null) return
        setActiveScriptSection(scriptSection)
    }, [scriptSection])

    const onClickAddScene = () => {
        if (editScriptComponentType === TrainingSectionComponentEnum.SCENE) {
            setAddScriptComponentType(null)
            return
        }
        setAddScriptComponentType(TrainingSectionComponentEnum.SCENE)
    }
    const onClickAddQuiz = () => {
        if (editScriptComponentType === TrainingSectionComponentEnum.QUIZ) {
            setAddScriptComponentType(null)
            return
        }
        setAddScriptComponentType(TrainingSectionComponentEnum.QUIZ)
    }
    const onClickAddFile = () => {
        if (editScriptComponentType === TrainingSectionComponentEnum.FILE) {
            setAddScriptComponentType(null)
            return
        }
        setAddScriptComponentType(TrainingSectionComponentEnum.FILE)
    }

    const onCollapseSection = (e: any) => {
        setCollapsed(!collapsed)
        const current = root.current as any
        if (current) {
            if (collapsed) {
                current.expand()
            } else {
                current.collapse()
            }
        }
    }

    const onSelectEditScene = (scene: Scene | null) => {
        if (!scene) {
            console.log('cancel', scene)
            // const scriptComponentsT = scriptComponents.filter((scriptComponent) => scriptComponent.id !== scene?.id)
            return
        } else {
            const newScriptComponent: TrainingSectionComponent = {
                id: uuidv4(),
                title: scene.name,
                description: scene.description,
                type: TrainingSectionComponentEnum.SCENE,
                dialogId: uuidv4(),
                params: ['99 persons', '33 scripts'],
            }
            const scriptComponentsT = [...scriptComponents, newScriptComponent]
            // trainingData?.trainingSections.find((section) => section.id === scriptSection.id)?.trainingSectionComponents.push(newScriptComponent)
            setScriptComponents(scriptComponentsT)
            setSceneToEdit(scene) // TODO fixowac
            onClickEditScriptComponent(newScriptComponent)
        }
    }
    const onPreviewScene = (scene: Scene | null) => {
        setSceneToPreview(scene)
        setSceneToEdit(null)
    }
    const onClickCloseEditorScene = () => {
        setSceneToEdit(null)
        setSceneToPreview(null)
        setSceneTrainingSectionComponentToEdit(null)
        //to do remove from scriptComponents
    }
    const onClickSaveEditorScene = () => {
        setSceneToEdit(null)
        setSceneToPreview(null)
        const scriptComponentsT = [...scriptComponents]
        setScriptComponents(scriptComponentsT)
        setSceneTrainingSectionComponentToEdit(null)
    }
    const onClickSelectSceneToEdit = (scene: Scene | null) => {
        onSelectEditScene(scene)
        setAddScriptComponentType(null)
    }
    const onClickEditScriptComponent = (sceneTrainingSectionComponent: TrainingSectionComponent) => {
        setSceneTrainingSectionComponentToEdit(sceneTrainingSectionComponent)
    }
    const onClickDeleteScriptComponent = (trainingSectionComponent: TrainingSectionComponent) => {
        const scriptComponentsT = [...scriptComponents].filter((sc) => sc.id !== trainingSectionComponent.id)
        setScriptComponents(scriptComponentsT)
        if (editScriptComponentType === trainingSectionComponent.type) {
            setAddScriptComponentType(null)
        }
    }
    if (activeScriptSection === null) return null

    return (
        <Panel
            header={`Section ${number}`}
            pt={{
                root: {
                    className: 'gradient',
                },
                content: {
                    className: 'pt-[0px]',
                },
            }}
        >
            <Panel
                headerTemplate={
                    <div className={'flex flex-row min-h-[50px] items-center p-[14px] bg-[var(--content)] rounded-[14px] justify-between'}>
                        <div className="flex flex-row  gap-[14px] ">
                            <span onClick={onCollapseSection} className="cursor-pointer">
                                <i className={PrimeIcons.CHEVRON_DOWN} />
                            </span>
                            <span>{activeScriptSection.title}</span>
                        </div>
                        <div className="flex flex-row  gap-[14px] ">
                            <ActionButton icon={PrimeIcons.PENCIL} onClick={() => onClickEdit(activeScriptSection)} />
                            <ActionButton icon={PrimeIcons.TRASH} onClick={() => onClickDelete(activeScriptSection)} />
                        </div>
                    </div>
                }
                pt={{
                    toggleableContent: {
                        className: 'bg-[transparent] p-[0px]',
                    },
                }}
                toggleable
                ref={root}
            >
                <div className={'flex flex-col gap-[14px]'}>
                    <p>
                        Number of steps in this section: <span className={'text-[var(--primary)]'}>{scriptComponents.length}</span>
                    </p>
                    {scriptComponents.map((scriptComponent, idx) => (
                        <ScriptSectionComponentCardComponent
                            key={`script-section_${scriptComponent.id}`}
                            index={idx + 1}
                            scriptComponent={scriptComponent}
                            onClickEdit={() => onClickEditScriptComponent(scriptComponent)}
                            onClickDelete={() => onClickDeleteScriptComponent(scriptComponent)}
                        ></ScriptSectionComponentCardComponent>
                    ))}
                </div>
            </Panel>

            <ScripscriptSectionComponentTypeSelectorComponent
                scriptSectionComponentType={editScriptComponentType}
                onSelectScene={onClickSelectSceneToEdit}
                onPreviewScene={onPreviewScene}
            />

            <div className={'flex flex-row gap-[14px]'}>
                <SecondaryButton label={'Scene'} icon={PrimeIcons.PLUS} onClick={onClickAddScene}></SecondaryButton>
                <div className={'relative'}>
                    <div className={'w-full h-full flex  justify-center items-center absolute'}>
                        <span className={'text-[var(--primary)] '} style={{ fontSize: '12px' }}>
                            Comming soon!
                        </span>
                    </div>
                    <div className="flex flex-row gap-[14px] opacity-35">
                        <SecondaryButton label={'Quiz'} icon={PrimeIcons.PLUS} onClick={onClickAddQuiz} disabled={true}></SecondaryButton>
                        <SecondaryButton label={'File'} icon={PrimeIcons.PLUS} onClick={onClickAddFile} disabled={true}></SecondaryButton>
                    </div>
                </div>
            </div>

            {sceneToPreview && (
                <ScriptScenePreviewComponent
                    scene={sceneToPreview}
                    autostart={false}
                    onSelect={(scene) => onClickSelectSceneToEdit(scene)}
                    onClose={() => setSceneToPreview(null)}
                ></ScriptScenePreviewComponent>
            )}
            {sceneTrainingSectionComponentToEdit && (
                <ScriptSceneEditorComponent
                    // scene={sceneToEdit}
                    sceneTemplate={sceneToEdit}
                    scriptComponent={sceneTrainingSectionComponentToEdit}
                    onClickSaveScene={onClickSaveEditorScene}
                    onClickCloseScene={onClickCloseEditorScene}
                ></ScriptSceneEditorComponent>
            )}
        </Panel>
    )
}
