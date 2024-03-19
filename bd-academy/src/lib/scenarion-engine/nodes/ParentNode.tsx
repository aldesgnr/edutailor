import { ClassicPreset, getUID } from 'rete'
import * as Socket from '../sockets/StatementNodeSockets'
import { NodeDef, NodeTypes } from '../types'
import { BaseNode } from './BaseNode'
import ScenarioEngine from '../scenarion-engine'

export class ParentNode extends BaseNode {
    public nodeType = NodeTypes.ParentNode
    public width = 180
    public height = 140
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) nodeDef = ParentNode.createNodeDef(getUID())
        super(nodeDef, scenarioEngine)
        // this.nodeDef = nodeDef
        // this.id = this.nodeDef.id
        //inputs
        this.addInput('in', new ClassicPreset.Input(Socket.input, 'in'))
        this.nodeDef.inputs.push({
            name: 'in',
        })
        this.addOutput('out', new ClassicPreset.Output(Socket.output, 'out'))
        this.nodeDef.outputs.push({
            name: 'out',
        })
    }

    data() {
        return {
            end: 'end',
        }
    }
    static createNodeDef(id: string): NodeDef {
        const nodeDef: NodeDef = {
            id: id,
            position: [0, 0],
            nodeType: NodeTypes.ParentNode,
            name: NodeTypes.ParentNode,
            parentNodeId: undefined,
            controls: [],
            inputs: [],
            outputs: [],
        }
        return nodeDef
    }
}
