import { ClassicPreset, getUID } from 'rete'
import ScenarioEngine from '../scenarion-engine'
import { NodeDef, NodeTypes } from '../types'
import * as Socket from '../sockets/StartNodeSockets'
import { BaseNode } from './BaseNode'
import { LabeledInputControl } from '../controls/labeled-input-control'

export class StartNode extends BaseNode {
    public nodeType = NodeTypes.StartNode
    public width = 200
    public height = 300
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = StartNode.createNodeDef(getUID())
        }
        super(nodeDef, scenarioEngine)

        // inputs
        if (this.hasInput('execute')) this.removeInput('execute')
        //outputs
        if (this.hasOutput('executed')) this.removeOutput('executed')
        this.addOutput('start', new ClassicPreset.Output(Socket.start, 'Start', true))
        //controls
        this.addControl('started', new LabeledInputControl('started', 'text', { initial: 'false', change: () => this.controlsUpdated.next() }))
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_: string, forward: (output: string) => void) {
        if (this.controls.started && (this.controls.started instanceof ClassicPreset.InputControl || this.controls.started instanceof LabeledInputControl)) {
            this.controls.started.setValue(true as any)
            this.scenarioEngine.area.update('control', this.controls.started.id)
        }
        this.executed.next()
        this.controlsUpdated.next()
        forward('start')
    }

    data() {
        if (this.controls.started instanceof ClassicPreset.InputControl) {
            return {
                start: this.controls.started?.value || false,
            }
        }
        return {
            start: false,
        }
    }

    static createNodeDef(id: string): NodeDef {
        const nodeDef: NodeDef = {
            id: id,
            position: [0, 0],
            nodeType: NodeTypes.StartNode,
            name: NodeTypes.StartNode,
            parentNodeId: undefined,
            controls: [],
            inputs: [],
            outputs: [],
        }
        return nodeDef
    }
}
