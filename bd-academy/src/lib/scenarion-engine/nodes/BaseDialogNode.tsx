import { ClassicPreset, getUID } from 'rete'
import { LabeledInputControl } from '../controls/labeled-input-control'
import { SelectControl } from '../controls/select-control'
import { StatementControl } from '../controls/statement-control'
import ScenarioEngine from '../scenarion-engine'
import * as Socket from '../sockets/BaseDialogNode'
import { ControlDef, InputDef, NodeDef, NodeTypes } from '../types'
import { BaseNode } from './BaseNode'

export class BaseDialogNode extends BaseNode {
    public nodeType = NodeTypes.BaseDialogNode
    public width = 400
    public height = 400 // set this to show border of scope
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) nodeDef = BaseDialogNode.createNodeDef(getUID())
        super(nodeDef, scenarioEngine)

        if (this.nodeDef?.parentNodeId !== undefined) {
            this.parent = this.nodeDef.parentNodeId
        }
        this.addControl('selectedStatement', new LabeledInputControl('selectedStatement', 'text', { initial: '' }))
        this.addControl('points', new LabeledInputControl('points', 'number', { initial: 0, change: (value) => this.updateControl('points', value) }))
        if (this.nodeDef.inputs && this.nodeDef.inputs.length > 0) {
            for (const inputDef of this.nodeDef.inputs) {
                const input = new ClassicPreset.Input(Socket.input, inputDef.name)
                this.addInput(inputDef.name, input)
                const inputControl = this.addInputControlDependOfType(inputDef)
                input.addControl(inputControl)
            }
        }

        if (this.nodeDef.outputs !== undefined) {
            this.nodeDef.outputs.forEach((output) => {
                this.addOutput(output.name, new ClassicPreset.Output(Socket.output, output.name))
            })
        }

        if (this.nodeDef.controls && this.nodeDef.controls.length > 0) {
            for (const controlDef of this.nodeDef.controls) {
                this.addControlDependOfType(controlDef)
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_: string, forward: (output: string) => void) {}

    data() {
        return {}
    }

    static createNodeDef(id: string): NodeDef {
        const nodeDef: NodeDef = {
            id: id,
            position: [0, 0],
            nodeType: NodeTypes.BaseNode,
            name: NodeTypes.BaseNode,
            parentNodeId: undefined,
            controls: [],
            inputs: [],
            outputs: [],
        }
        return nodeDef
    }
    protected addInputControlDependOfType(inputDef: InputDef) {
        let control
        if (inputDef.type === 'statement') {
            control = new StatementControl(inputDef.name, {
                initial: {
                    value: typeof inputDef.value === 'string' ? inputDef.value : '',
                    points: inputDef.points ? inputDef.points : 0,
                },
                change: (param: 'value' | 'points', value) => {
                    if (inputDef[param] !== undefined) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        inputDef[param] = value as any
                    }
                    this.controlsUpdated.next()
                },
                delete: () => {
                    if (!inputDef) return
                    this.onDeleteControl(inputDef)
                },
            })
        } else {
            control = new ClassicPreset.InputControl('text', {
                initial: inputDef.value,
                change: (value) => {
                    inputDef.value = value
                    this.controlsUpdated.next()
                },
            })
        }
        const inputsExists = this.nodeDef.inputs.find((i) => {
            return i.name === inputDef.name
        })
        if (!inputsExists) this.nodeDef.inputs.push(inputDef)
        this.controlsUpdated.next()

        return control
    }
    protected addControlDependOfType(controlDef: ControlDef) {
        let control
        if (controlDef.type === 'select') {
            control = new SelectControl(controlDef.name, {
                initial: typeof controlDef.value === 'string' ? controlDef.value : '',
                change: (value) => {
                    controlDef.value = value
                    this.controlsUpdated.next()
                },
                options: [{ text: 'Wanda' }, { text: 'Doctor' }],
            })
            this.addControl(controlDef.name, control)
        } else if (controlDef.type === 'statement') {
            this.addCustomStatementControlAndOutput(controlDef.name)
        } else {
            control = new ClassicPreset.InputControl('text', {
                initial: controlDef.value,
                change: (value) => {
                    controlDef.value = value
                    this.controlsUpdated.next()
                },
            })
            this.addControl(controlDef.name, control)
        }
        const controlsExists = this.nodeDef.controls.find((i) => {
            return i.name === controlDef.name
        })
        if (!controlsExists) this.nodeDef.controls.push(controlDef)
        return control
    }
    protected onDeleteControl(controlDef: ControlDef | InputDef) {
        if (this.hasControl(controlDef.name)) {
            this.removeControl(controlDef.name)
            this.nodeDef.controls = this.nodeDef.controls.filter((c) => c.name !== controlDef.name)
        }
        if (this.hasOutput(controlDef.name)) {
            this.scenarioEngine.editor
                .getConnections()
                .filter((c) => c.source === this.id && c.sourceOutput === controlDef.name)
                .forEach((c) => this.scenarioEngine.editor.removeConnection(c.id))
            this.removeOutput(controlDef.name)
            this.nodeDef.outputs = this.nodeDef.outputs.filter((c) => c.name !== controlDef.name)
        }
        if (this.hasInput(controlDef.name)) {
            this.scenarioEngine.editor
                .getConnections()
                .filter((c) => c.target === this.id && c.targetInput === controlDef.name)
                .forEach((c) => this.scenarioEngine.editor.removeConnection(c.id))
            this.removeInput(controlDef.name)
            this.nodeDef.inputs = this.nodeDef.inputs.filter((c) => c.name !== controlDef.name)
        }
        this.controlsUpdated.next()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private updateControl(name: string, value: any) {
        if (this.nodeDef && this.nodeDef.controls) {
            const controlDef = this.nodeDef.controls.find((c) => c.name === name)
            if (controlDef) controlDef.value = value
        }
        this.controlsUpdated.next()
    }
    public async addCustomStatementControlAndOutput(name: string) {
        if (this.nodeDef && this.nodeDef.controls && !this.nodeDef.controls.find((c) => c.name === name))
            this.nodeDef.controls.push({ name: name, type: 'statement', value: 'Type text', points: 0, delay: 'Infinity' })
        const controlDef = this.nodeDef?.controls.find((c) => c.name === name)
        const control = new StatementControl(name, {
            initial: {
                value: typeof controlDef?.value === 'string' ? controlDef.value : 'Type text',
                points: controlDef?.points ? controlDef.points : 0,
            },
            change: (param: 'value' | 'points', value) => {
                if (!controlDef) return
                if (controlDef[param] !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    controlDef[param] = value as any
                }
                this.controlsUpdated.next()
            },
            delete: () => {
                if (!controlDef) return
                this.onDeleteControl(controlDef)
            },
        })
        this.addControl(name, control)
        this.addOutput(name, new ClassicPreset.Output(Socket.output, name))

        await this.scenarioEngine.area.resize(this.id, this.width, this.height + 50)
        await this.scenarioEngine.area.update('node', this.id)
    }
}
