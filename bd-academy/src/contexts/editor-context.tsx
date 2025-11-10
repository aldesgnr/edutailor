import { Toast } from 'primereact/toast'
import React, { ReactElement, createContext, useMemo, useRef, useState } from 'react'
import { EditorManager } from '../lib/editor-manager/editor-manager'
import ScenarioEngine from '../lib/scenarion-engine/scenarion-engine'
import SceneMiddelware from '../lib/scene-middelware/scene-middelware'
import ViewerManager from '../lib/viewer-manager/viewer-manager'

interface EditorContextState {
    // testManager: TestManager
    editorManager: EditorManager
    viewerManager: ViewerManager
    // sceneMiddelware: SceneMiddelware
    // scenarioEngine: ScenarioEngine
}

// const defTestManager = new TestManager()
// const defSceneMiddelware = new SceneMiddelware()
// const defScenarioEngine = new ScenarioEngine(null, defSceneMiddelware)
const defViewerManager = new ViewerManager()
const defEditorManager = new EditorManager()

const defaultEditorContextState = {
    // testManager: defTestManager,
    editorManager: defEditorManager,
    viewerManager: defViewerManager,
    // sceneMiddelware: defSceneMiddelware,
    // scenarioEngine: defScenarioEngine,
}

const EditorContext = createContext<EditorContextState>(defaultEditorContextState)
const EditorProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const toast = useRef(null)
    // const [testManager] = useState<TestManager>(defTestManager)
    const [viewerManager] = useState<ViewerManager>(defViewerManager)
    const [editorManager] = useState<EditorManager>(defEditorManager)
    // const [sceneMiddelware] = useState<SceneMiddelware>(defSceneMiddelware)
    // const [scenarioEngine] = useState<ScenarioEngine>(defScenarioEngine)

    const contextValue = useMemo(
        () => ({
            // testManager,
            viewerManager,
            editorManager,
            // sceneMiddelware,
            // scenarioEngine,
        }),
        [],
    )
    return (
        <EditorContext.Provider value={contextValue}>
            <Toast ref={toast} />
            {children}
        </EditorContext.Provider>
    )
}

export { EditorContext, EditorProvider }
