import { FunctionComponent, useContext, useEffect, useState } from 'react'

import { EditorContext } from '../../contexts/editor-context'

export const DialogBuilder: FunctionComponent<{ dialogId: string }> = ({ dialogId }) => {
    const { editorManager } = useContext(EditorContext)
    const [scenarioEngineContainer, setscenarioEngineContainer] = useState<HTMLDivElement | null>(null)
    const [dUUID, setDialogUUID] = useState<string | null>(null)

    useEffect(() => {
        setDialogUUID(dialogId)
    }, [dialogId])

    // useEffect(() => {
    //     if (dUUID !== null) {
    //         scenarioEngine
    //             .loadDialog(dUUID)
    //             .then((d) => {
    //                 console.log(d)
    //             })
    //             .catch((err) => {
    //                 console.log(err)
    //             })
    //     }
    // }, [dUUID, scenarioEngine])

    useEffect(() => {
        if (!scenarioEngineContainer) return

        const editorContainer = editorManager.scenarioEngine.editorContainer
        scenarioEngineContainer.append(editorContainer)
        editorContainer.id = 'graph-container'
        editorContainer.style.position = 'relative'
        editorContainer.style.width = '100%'
        editorContainer.style.height = '100%'
        editorContainer.style.display = 'block'
        editorContainer.style.color = 'block'

        return () => {
            scenarioEngineContainer.removeChild(editorContainer)
        }
    }, [scenarioEngineContainer])

    return (
        <div className="flex h-full w-full flex-row">
            <div
                className="w-full h-full"
                ref={(data) => {
                    setscenarioEngineContainer(data)
                }}
            ></div>
        </div>
    )
}
