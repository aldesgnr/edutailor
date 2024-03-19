import { ClassicPreset, getUID } from 'rete'

import { ButtonControl } from '../controls/button-control'
import ScenarioEngine from '../scenarion-engine'
import { NodeDef, NodeTypes } from '../types'
import { BaseNode } from './BaseNode'
import { StatementNode } from './StatementNode'

export class SummaryPointsNode extends BaseNode {
    public nodeType = NodeTypes.SummaryPointsNode
    public width = 200
    public height = 200
    constructor(
        nodeDef: NodeDef | undefined,
        public scenarioEngine: ScenarioEngine,
    ) {
        if (!nodeDef) {
            nodeDef = SummaryPointsNode.createNodeDef(getUID())
        }
        super(nodeDef, scenarioEngine)
        this.addOutput('summary', new ClassicPreset.Output(new ClassicPreset.Socket('summary'), 'Summary', true))
        this.addControl('summary', new ClassicPreset.InputControl('number', { initial: 0, change: () => this.controlsUpdated.next() }))

        this.addControl(
            'button',
            new ButtonControl('Add input', async () => {
                this.addCustomInput('points_' + getUID())
            }),
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statementNodesList = this.scenarioEngine.editor.getNodes().filter((node: any) => node instanceof StatementNode)

        // eslint-disable-next-line @typescript-eslint/ban-types
        const connectionToCreate: Function[] = []

        statementNodesList.forEach(async (statementNode) => {
            const name = 'points_' + statementNode.id
            await this.addCustomInput(name)

            const callback = async () => {
                const c = new ClassicPreset.Connection(statementNode, 'points', this, name)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await this.scenarioEngine.editor.addConnection(c as any)
            }
            connectionToCreate.push(callback)
        })
        setTimeout(async () => {
            connectionToCreate.forEach(async (callback) => {
                await callback()
                this.scenarioEngine.area.update('node', this.id)
            })
            await this.scenarioEngine.area.resize(this.id, this.width, this.height + connectionToCreate.length * 50)
        }, 250)
    }
    private async addCustomInput(name: string) {
        this.addInput(name, new ClassicPreset.Input(new ClassicPreset.Socket('points'), name, true))

        await this.scenarioEngine.area.resize(this.id, this.width, this.height + 50)
        await this.scenarioEngine.area.update('node', this.id)
    }

    async execute(_: string, forward: (output: string) => void) {
        ///jest propblem znodami i odsiezaniem punktow. lepiej by bylo miec te dane a w engine odczytywac niz tam przechwytywac eventy
        const data = await this.scenarioEngine.dataflowEngine.fetchInputs(this.id)

        // const node = this.scenarioEngine.editor.getNodes().find((node: any) => node.id === _.split('_')[1])
        // console.log('exetuce', _, node.controls.points.value, data)
        let summary = 0
        Object.keys(data)
            .filter((p) => p.indexOf('points') !== -1)
            .forEach((key) => {
                summary += parseInt(data[key])
            })
        if (this.controls.summary && this.controls.summary instanceof ClassicPreset.InputControl) {
            this.controls.summary?.setValue(summary)
            this.scenarioEngine.area.update('control', this.controls.summary.id)
        }
        if (this.controls.ended && this.controls.ended instanceof ClassicPreset.InputControl) {
            this.controls.ended?.setValue(true)
            this.scenarioEngine.area.update('control', this.controls.ended.id)
        }
        this.executed.next()
        this.scenarioEngine.textDialogMiddelware.clearDialogs()
        forward('summary')
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
