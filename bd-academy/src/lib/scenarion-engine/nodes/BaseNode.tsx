import { ClassicPreset, getUID } from 'rete'
import { BehaviorSubject, Subject } from 'rxjs'
import { LabeledInputControl } from '../controls/labeled-input-control'
import ScenarioEngine from '../scenarion-engine'
import * as Socket from '../sockets/BaseDialogNode'
import { NodeDef, NodeTypes } from '../types'

export interface Position {
    x: number
    y: number
}
export class BaseNode extends ClassicPreset.Node {
    public nodeDef: NodeDef
    public nodeType = NodeTypes.BaseNode
    public parent: string | undefined
    public width = 200
    public height = 300
    public executed = new Subject<void>()
    public controlsUpdated = new Subject<void>()
    public positionChanged = new BehaviorSubject<{ x: number; y: number }>({ x: 0, y: 0 })

    constructor(
        nodeDef: NodeDef,
        public scenarioEngine: ScenarioEngine,
    ) {
        const label = `${nodeDef.nodeType} | ${nodeDef.id}`
        super(label)
        this.nodeDef = nodeDef
        this.id = this.nodeDef.id
        this.onIdChange(this.nodeDef.id)
        const [x, y] = this.nodeDef.position
        this.scenarioEngine.area.translate(this.id, { x, y })
        this.positionChanged.next({ x, y })
        // inputs
        this.addInput('execute', new ClassicPreset.Input(Socket.input, 'execute'))
        //outputs
        this.addOutput('executed', new ClassicPreset.Output(Socket.output, 'executed'))
        //controls
        this.addControl('id', new LabeledInputControl('id', 'text', { initial: this.nodeDef.id, change: (value) => this.onIdChange(value) }))

        this.positionChanged.subscribe((position) => {
            this.nodeDef!.position = [position.x, position.y]
            this.calcHeight()
        })

        this.controlsUpdated.subscribe(() => {
            this.scenarioEngine.area.update('node', this.id)
            this.calcHeight()
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(_: string, forward: (output: string) => void) {
        this.executed.next()
    }
    data() {
        return {}
    }

    private onIdChange(value: string) {
        this.label = `${this.nodeDef?.nodeType} | ${value}`
        this.scenarioEngine.area.update('node', this.id)
    }

    public calcHeight = async () => {
        let calculatedHeight = 0
        if (this.nodeType === NodeTypes.ParentNode) return
        const el = this.scenarioEngine.area.nodeViews.get(this.id)?.element
        if (!el) return
        const wrapper = el.querySelector('[data-testid]')
        if (!wrapper) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        calculatedHeight = [...wrapper.children].map((a: any) => a.offsetHeight).reduce((a, b) => a + b, 0)
        calculatedHeight += 20
        // }

        if (calculatedHeight === this.height) return
        this.height = calculatedHeight
        // await this.scenarioEngine.area.resize(this.id, this.width, this.height)
        await this.scenarioEngine.area.update('node', this.id)
    }

    public exportToJson() {
        return this.nodeDef
    }
}
