import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { EditorContext } from '../../../contexts/editor-context'

export const EditorCanvas: FunctionComponent = () => {
    const { editorManager } = useContext(EditorContext)
    const [canvasContainer, setCanvasContainer] = useState<HTMLDivElement | null>(null)
    const [debugToolsContainer, setDebugToolsContainer] = useState<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!canvasContainer) return
        const editorCanvas = editorManager.canvas
        editorCanvas.style.position = 'relative'
        editorCanvas.style.maxWidth = '100%'
        editorCanvas.style.width = '100%'
        editorCanvas.style.height = '100%'
        editorCanvas.style.maxHeight = '100%'
        editorCanvas.style.minWidth = '100px'
        editorCanvas.style.minHeight = '100px'
        editorCanvas.style.display = 'block'
        editorCanvas.style.backgroundColor = '#4e4e4e'
        canvasContainer.appendChild(editorCanvas)

        return () => {
            canvasContainer.removeChild(editorCanvas)
        }
    }, [canvasContainer])

    useEffect(() => {
        if (!debugToolsContainer) return
        if (!editorManager.debug) return
        const debugTools = editorManager.debugTools
        debugToolsContainer.append(debugTools)
        return () => {
            debugToolsContainer.removeChild(debugTools)
        }
    }, [debugToolsContainer])

    return (
        <>
            <div
                className="w-full h-full "
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
        </>
    )
}
