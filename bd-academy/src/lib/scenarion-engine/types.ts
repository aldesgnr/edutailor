export enum NodeTypes {
    BaseNode = 'BaseNode',
    StatementNode = 'StatementNode',
    StartNode = 'StartNode',
    EndNode = 'EndNode',
    ParentNode = 'ParentNode',
    NPCNode = 'NPCNode',
    HintNode = 'HintNode',
    SummaryPointsNode = 'SummaryPointsNode',
    BaseDialogNode = 'BaseDialogNode',
}
export interface NodeDef {
    id: string
    position: [number, number]
    nodeType: NodeTypes
    parentNodeId?: string
    controls: ControlDef[]
    inputs: InputDef[]
    outputs: OutputDef[]
    name: string
}
export interface ConnectionDef {
    id?: string
    source: string
    sourceOutput: string
    target: string
    targetInput: string
}
export interface OutputDef {
    name: string
}
export interface InputDef {
    name: string
    points?: number
    delay?: string
    type?: 'text' | 'number' | 'select' | 'statement' | 'textarea'
    value?: string | number | boolean
}
export interface ControlDef {
    name: string
    points?: number
    delay?: string
    type?: 'text' | 'number' | 'select' | 'statement' | 'textarea'
    value?: string | number | boolean
}
export interface DialogJson {
    scenario: {
        language: string
        name: string
        uuid: string
    }
    nodes: NodeDef[]
    connections: ConnectionDef[]
}
