import { ClassicPreset, getUID } from 'rete'
import { LabeledInputControl } from '../controls/labeled-input-control'
import ScenarioEngine from '../scenarion-engine'
import * as Socket from '../sockets/EndNodeSockets'
import { NodeDef, NodeTypes } from '../types'
import { BaseNode } from './BaseNode'

export class EndNode extends BaseNode {
    public nodeType = NodeTypes.EndNode
    public width = 200
    public height = 300
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = EndNode.createNodeDef(getUID())
        }
        super(nodeDef, scenarioEngine)
        // inputs
        this.addInput('end', new ClassicPreset.Input(Socket.end, 'End', true))
        if (this.hasInput('execute')) this.removeInput('execute')
        //outputs
        //controls
        this.addControl('ended', new LabeledInputControl('ended', 'text', { initial: 'false', change: () => this.controlsUpdated.next() }))
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_: string, forward: (output: string) => void) {
        if (this.controls.ended && (this.controls.ended instanceof ClassicPreset.InputControl || this.controls.started instanceof LabeledInputControl)) {
            ;(this.controls.ended as any).setValue(true as any)
            this.scenarioEngine.area.update('control', this.controls.ended.id)
        }
        this.executed.next()
        this.scenarioEngine.textDialogMiddelware.clearDialogs()
        this.controlsUpdated.next()
        this.scenarioEngine.area.update('node', this.id)
        this.scenarioEngine.ended.next(true)
        forward('executed')
    }

    data() {
        return {
            points: this.controls['points'],
        }
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
