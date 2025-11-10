//create react component function

import { FunctionComponent, useEffect, useState } from 'react'
import { TrainingSectionComponentEnum } from '../script-section-component-card'
import { ScriptQuizComponent } from '../script-quiz'
import { ScriptFileComponent } from '../script-file'
import { ScriptSceneComponent } from '../script-scene'
import { Scene } from '../../../lib/editor-manager/editor.types'
export type ScripscriptSectionComponentTypeSelectorComponentProps = {
    scriptSectionComponentType: TrainingSectionComponentEnum | null
    onSelectScene: (scene: Scene | null) => void
    onPreviewScene: (scene: Scene | null) => void
}

export const ScripscriptSectionComponentTypeSelectorComponent: FunctionComponent<ScripscriptSectionComponentTypeSelectorComponentProps> = ({
    scriptSectionComponentType,
    onSelectScene,
    onPreviewScene,
}) => {
    const [selectedScriptSectionComponentType, setSelectedScriptSectionComponentType] = useState<TrainingSectionComponentEnum | null>(null)

    useEffect(() => {
        setSelectedScriptSectionComponentType(scriptSectionComponentType)
    }, [scriptSectionComponentType])

    if (selectedScriptSectionComponentType === null) return <></>
    if (selectedScriptSectionComponentType === TrainingSectionComponentEnum.QUIZ) return <ScriptQuizComponent></ScriptQuizComponent>
    if (selectedScriptSectionComponentType === TrainingSectionComponentEnum.FILE) return <ScriptFileComponent></ScriptFileComponent>
    if (selectedScriptSectionComponentType === TrainingSectionComponentEnum.SCENE)
        return <ScriptSceneComponent onSelectScene={onSelectScene} onPreviewScene={onPreviewScene}></ScriptSceneComponent>

    return <></>
}
