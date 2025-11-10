import { ClassicPreset, getUID } from 'rete'
import ScenarioEngine from '../scenarion-engine'
import { InputDef, NodeDef, NodeTypes } from '../types'
import { BaseDialogNode } from './BaseDialogNode'
import { LabeledInputControl } from '../controls/labeled-input-control'
import { ButtonControl } from '../controls/button-control'
import * as Socket from '../sockets/BaseDialogNode'

export class NPCNode extends BaseDialogNode {
    public nodeType = NodeTypes.NPCNode
    public width = 400
    public height = 400
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = NPCNode.createNodeDef(getUID())
        }
        super(nodeDef, scenarioEngine)

        const statements = this.nodeDef.inputs?.filter((control) => {
            return control.name.indexOf('statement') !== -1
        })
        if (statements?.length === 1 && this.hasControl('selectedStatement')) {
            if (this.controls.selectedStatement instanceof ClassicPreset.InputControl || this.controls.selectedStatement instanceof LabeledInputControl) {
                this.controls.selectedStatement.value = statements[0].name
                this.scenarioEngine.area.update('control', this.controls.selectedStatement.id)
            }
        }
        //controls
        this.addControl(
            'addStatement',
            new ButtonControl('Add statement', async () => {
                const newInputDef: InputDef = {
                    type: 'statement',
                    name: 'statement' + getUID(),
                    points: 0,
                    delay: 'Infinity',
                    value: 'Type text',
                }
                const input = new ClassicPreset.Input(Socket.input, newInputDef.name)
                this.addInput(newInputDef.name, input)
                const inputControl = this.addInputControlDependOfType(newInputDef)
                input.addControl(inputControl)
                this.controlsUpdated.next()
            }),
        )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async execute(_: string, forward: (output: any) => void) {
        if (_.indexOf('statement') === 0) {
            if (this.controls.selectedStatement instanceof ClassicPreset.InputControl || this.controls.selectedStatement instanceof LabeledInputControl) {
                this.controls.selectedStatement.setValue(_)
            }
            // this.scenarioEngine.textDialogMiddelware.clearDialogs()
            // const statementInputControl = this.inputs[_].control
            // const statementDef = this.nodeDef.inputs.find((input) => input.name === _)
            // this.scenarioEngine.textDialogMiddelware.addDialog(statementInputControl, _)
        }
        if (_ === 'execute') {
            // const data = await this.scenarioEngine.dataflowEngine.fetchInputs(this.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const selectedStatement = (this.controls as any)['selectedStatement'].value
            if (selectedStatement && this.hasInput(selectedStatement)) {
                const statementInputControl = this.inputs[selectedStatement]?.control
                const statementDef = this.nodeDef?.inputs.find((input) => input.name === selectedStatement)
                if (statementInputControl === null || statementInputControl === undefined || statementDef === undefined) return
                this.scenarioEngine.clearDialogs()
                this.scenarioEngine.addDialog(statementDef, statementInputControl.id + '_' + selectedStatement)
                const obs = this.scenarioEngine.textDialogMiddelware.observ.get(statementInputControl.id + '_' + selectedStatement)
                obs?.subscribe((val) => {
                    if (val) {
                        if (
                            this.controls.points &&
                            (this.controls.points instanceof ClassicPreset.InputControl || this.controls.points instanceof LabeledInputControl)
                        ) {
                            this.controls.points.setValue(statementDef.points as any)
                            this.scenarioEngine.area.update('control', this.controls.points.id)
                        }
                        if (this.controls.selectedStatement && this.controls.selectedStatement instanceof ClassicPreset.InputControl) {
                            this.controls['selectedStatement'].setValue(selectedStatement)
                            this.scenarioEngine.area.update('control', this.controls['selectedStatement'].id)
                        }
                        forward('executed')
                    }
                })
                this.scenarioEngine.textDialogMiddelware.onDialogSelected(statementDef, statementInputControl.id + '_' + selectedStatement)
            }
        }
    }

    data() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const returnData: Record<string, any> = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            executed: (this.controls.selectedStatement as any).value ? true : false,
        }
        Object.keys(this.controls).forEach((controlName) => {
            if (controlName.indexOf('statement') !== 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (returnData[controlName] = (this.controls[controlName] as any)?.value)
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this.controls[controlName] as any)?.value === (this.controls.selectedStatement as any).value) {
                returnData[controlName] = true
            } else {
                returnData[controlName] = false
            }
        })
        return returnData
    }

    static createNodeDef(id: string): NodeDef {
        const nodeDef: NodeDef = {
            id: id,
            position: [0, 0],
            nodeType: NodeTypes.NPCNode,
            name: NodeTypes.NPCNode,
            parentNodeId: undefined,
            controls: [
                {
                    name: 'person',
                    type: 'select',
                    value: 'Wanda',
                },
            ],
            inputs: [
                {
                    name: 'statement1',
                    points: 0,
                    delay: 'Infinity',
                    type: 'statement',
                    value: 'Type text',
                },
            ],
            outputs: [],
        }
        return nodeDef
    }
}
