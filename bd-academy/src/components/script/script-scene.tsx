//create react component function

import { Card } from 'primereact/card'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { EditorContext } from '../../contexts/editor-context'
import { Scene } from '../../lib/editor-manager/editor.types'
import { SecondaryButton } from '../common/secondary-button/secondary-button'

export type ScriptSceneComponentProps = {
    onSelectScene: (scene: Scene | null) => void
    onPreviewScene: (scene: Scene | null) => void
}

export const ScriptSceneComponent: FunctionComponent<ScriptSceneComponentProps> = ({ onSelectScene, onPreviewScene }) => {
    const { editorManager } = useContext(EditorContext)
    const [predefinedScenes, setPredefinedScenes] = useState<Scene[]>([])

    const header = (scene: Scene) => {
        return <img className={'h-[210px] w-[283px] object-cover'} alt={scene.name} src={scene.image} width={283} height={210} />
    }
    useEffect(() => {
        const predefinedScenes$ = editorManager.possibleScenes.subscribe((scenes) => {
            setPredefinedScenes(scenes)
        })
        return () => {
            predefinedScenes$.unsubscribe()
        }
    }, [editorManager])

    return (
        <div>
            <div className={'flex flex-row gap-[14px] bg-[transparent] rounded-[14px] p-[14px]'}>
                {predefinedScenes.map((scene) => (
                    <Card key={scene.id} header={header(scene)} className="w-[280px]  ">
                        <div className={'gap-[24px] flex flex-col'}>
                            <div>
                                <div className="text-[20px] leading-[20px] pb-[8px]">{scene.name}</div>
                                <span>{scene.description}</span>
                            </div>
                            <div className={'flex flex-col gap-[14px]'}>
                                <SecondaryButton label={'Preview'} onClick={() => onPreviewScene(scene)}></SecondaryButton>
                                <SecondaryButton label={'Select'} onClick={() => onSelectScene(scene)}></SecondaryButton>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
