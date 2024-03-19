import { ClassicPreset, getUID } from 'rete'
import ScenarioEngine from '../../scenarion-engine/scenarion-engine'
import { ButtonControl } from '../controls/button-control'
import * as Socket from '../sockets/StatementNodeSockets'
import { NodeDef, NodeTypes } from '../types'
import { BaseDialogNode } from './BaseDialogNode'

export type NodeEvents = {
    onBeforeExecte?: () => void
    onAfterExecte?: () => void
    onBeforeForward?: () => void
    onAfterForward?: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChangePoints?: (value: any) => void
}
export class StatementNode extends BaseDialogNode {
    public nodeType = NodeTypes.StatementNode
    public width = 400
    public height = 600
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = StatementNode.createNodeDef(getUID())
        }

        super(nodeDef, scenarioEngine)

        // inputs
        //outputs
        this.addOutput('points', new ClassicPreset.Output(Socket.points, 'points'))
        //controls
        this.addControl(
            'addStatement',
            new ButtonControl('Add statement', async () => {
                this.addCustomStatementControlAndOutput('statement' + getUID())
                this.controlsUpdated.next()
            }),
        )
    }

    execute(_: string, forward: (output: string) => void) {
        const statements = Object.keys(this.controls).filter((control) => control.indexOf('statement') !== -1)
        this.scenarioEngine.clearDialogs()
        statements.forEach((statementKey) => {
            const statementControl = this.controls[statementKey]
            const statementDef = this.nodeDef?.controls.find((input) => input.name === statementKey)
            if (statementControl === null || statementControl === undefined || statementDef === undefined) return
            // this.scenarioEngine.textDialogMiddelware.addDialog(statementDef, statementControl.id + '_' + statementKey)
            this.scenarioEngine.addDialog(statementDef, statementControl.id + '_' + statementKey)
            const obs = this.scenarioEngine.textDialogMiddelware.observ.get(statementControl.id + '_' + statementKey)
            obs?.subscribe(() => {
                if (this.controls.points && statementDef.points !== undefined && this.controls.points instanceof ClassicPreset.InputControl) {
                    this.controls.points.setValue(statementDef.points)
                    this.scenarioEngine.area.update('control', this.controls.points.id)
                }
                if (this.controls.selectedStatement && this.controls.selectedStatement instanceof ClassicPreset.InputControl) {
                    this.scenarioEngine.area.update('control', this.controls.selectedStatement.id)
                }
                this.controlsUpdated.next()
                forward('points')
                forward(statementKey)
                forward('executed')
            })
        })
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
            nodeType: NodeTypes.StatementNode,
            name: NodeTypes.StatementNode,
            parentNodeId: undefined,
            controls: [
                {
                    name: 'person',
                    value: 'Doctor',
                    type: 'select',
                },
                {
                    name: 'statement1',
                    points: 0,
                    delay: 'Infinity',
                    type: 'statement',
                    value: 'Type text',
                },
            ],
            inputs: [],
            outputs: [],
        }
        return nodeDef
    }
}
