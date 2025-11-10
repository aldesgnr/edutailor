import { getUID } from 'rete'
import { LabeledInputControl } from '../controls/labeled-input-control'
import { LabeledTextareaControl } from '../controls/labeled-textarea-control'
import ScenarioEngine from '../scenarion-engine'
import { NodeDef, NodeTypes } from '../types'
import { BaseNode } from './BaseNode'

export class HintNode extends BaseNode {
    public nodeType = NodeTypes.HintNode
    public width = 400
    public height = 400
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = HintNode.createNodeDef(getUID())
        }
        super(nodeDef, scenarioEngine)
        this.addControl('title', new LabeledInputControl('title', 'text', { initial: '' }))
        this.addControl('text', new LabeledTextareaControl('text', { initial: '' }))
    }
    async execute(_: string, forward: (output: any) => void) {}

    data() {
        return {}
    }
    static createNodeDef(id: string): NodeDef {
        const nodeDef: NodeDef = {
            id: id,
            position: [0, 0],
            nodeType: NodeTypes.EndNode,
            name: NodeTypes.EndNode,
            parentNodeId: undefined,
            controls: [],
            inputs: [],
            outputs: [],
        }
        return nodeDef
    }
}
