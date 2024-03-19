//create react component function

import { Dialog } from 'primereact/dialog'
import { FunctionComponent, useEffect, useState } from 'react'
import { SecondaryButton } from '../common/secondary-button/secondary-button'
import { PrimaryButton } from '../common/primary-button/primary-button'
import { ViewerComponent } from '../viewer/viewer.component'
import { Scene } from '../../lib/editor-manager/editor.types'

export type ScriptScenePreviewComponentProps = {
    scene: Scene
    autostart?: boolean
    onSelect: (scene: any) => void
    onClose: () => void
}

export const ScriptScenePreviewComponent: FunctionComponent<ScriptScenePreviewComponentProps> = ({ scene, autostart = false, onClose, onSelect }) => {
    // const [predefinedScenes, setPredefinedScenes] = useState<Scene[]>([])
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (!visible) {
            onClose()
        }
    }, [visible])

    // const onErrorLoadingTraining = (err) => {
    // setTimeout(() => {
    //     setVisible(false)
    // }, 100)
    // }

    return (
        <div className={''}>
            <Dialog
                header="Header"
                visible={visible}
                style={{ width: '80vw', height: '80vh' }}
                onHide={() => setVisible(false)}
                draggable={false}
                headerStyle={{ display: 'none' }}
                contentStyle={{ overflow: 'hidden' }}
                className="preview-scene"
                pt={{
                    root: {
                        className: 'bg-[var(--Section-Hover)] p-[16px]',
                    },
                    header: {
                        className: 'bg-transparent',
                    },
                    content: {
                        className: 'bg-transparent p-0',
                    },
                }}
                closeIcon={false}
            >
                <div className="flex flex-col h-full gap-[16px] justify-center ">
                    <div className="text-center">Scene : {scene.name}</div>
                    <div className={'border-[1px] border-[var(--dark-600)] h-full bg-[var(--content)] rounded-[8px]  relative'}>
                        <ViewerComponent
                            trainingSceneUUID={scene.previewSceneTraining}
                            autostart={autostart}
                            // onErrorLoading={onErrorLoadingTraining}
                        ></ViewerComponent>
                    </div>
                    <div className={'flex flex-row justify-center items-center gap-[16px]'}>
                        <SecondaryButton label={'Close window'} onClick={() => setVisible(false)}></SecondaryButton>
                        <PrimaryButton
                            label={'Select scene and go to edit'}
                            onClick={() => {
                                onSelect(scene)
                                setVisible(false)
                            }}
                        ></PrimaryButton>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
