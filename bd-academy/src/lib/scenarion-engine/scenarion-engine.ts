import {
    AppBase,
    Application,
    Color,
    ELEMENTTYPE_IMAGE,
    ELEMENTTYPE_TEXT,
    Entity,
    FITTING_BOTH,
    FITTING_NONE,
    ORIENTATION_VERTICAL,
    Vec2,
    Vec4,
} from 'playcanvas'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'
import { createRoot } from 'react-dom/client'
import { ClassicPreset, GetSchemes, NodeEditor } from 'rete'
import { AreaExtensions, AreaPlugin, NodeView } from 'rete-area-plugin'
import { ArrangeAppliers, Presets as ArrangePresets, AutoArrangePlugin } from 'rete-auto-arrange-plugin'
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin'
import { ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin'
import { ControlFlowEngine, DataflowEngine } from 'rete-engine'
import { Presets, ReactArea2D, ReactPlugin } from 'rete-react-plugin'
import { ScopesPlugin, Presets as ScopesPresets } from 'rete-scopes-plugin'
import { BehaviorSubject, Subject } from 'rxjs'
import { http } from '../../interceptors/axios'
import SceneMiddelware from '../scene-middelware/scene-middelware'
import TextDialogMiddelware from '../scene-middelware/text-dialog-middelware'
import { ButtonControl, CustomButton } from './controls/button-control'
import { CustomLabeledInput, LabeledInputControl } from './controls/labeled-input-control'
import { CustomTextarea, LabeledTextareaControl } from './controls/labeled-textarea-control'
import { CustomSelect, SelectControl } from './controls/select-control'
import { CustomStatement, StatementControl } from './controls/statement-control'
import { BaseNode } from './nodes/BaseNode'
import { EndNode } from './nodes/EndNode'
import { HintNode } from './nodes/HintNode'
import { NPCNode } from './nodes/NPCNode'
import { ParentNode } from './nodes/ParentNode'
import { StartNode } from './nodes/StartNode'
import { StatementNode } from './nodes/StatementNode'
import { SummaryPointsNode } from './nodes/SummaryPointsNode'
import { ControlDef, DialogJson, NodeDef, NodeTypes } from './types'

// type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra
type AreaExtra = ReactArea2D<Schemes>
class Connection<N extends BaseNode> extends ClassicPreset.Connection<N, N> { }
export type Schemes = GetSchemes<BaseNode, Connection<BaseNode>>

//  type Schemes = GetSchemes<BaseNode, ClassicPreset.Connection<BaseNode, BaseNode>>

export default class ScenarioEngine {
    public controlflowEngine
    public dataflowEngine
    public sceneMiddelware: SceneMiddelware | undefined
    public editor
    public area
    private connection
    private contextMenu
    private arrange
    private applier
    private render
    private scopes
    private socket
    public readonly editorContainer: HTMLDivElement
    private dialogUUID = ''
    private _debug = false
    public started = new BehaviorSubject<boolean>(false)
    public ended = new Subject<boolean>()
    public scenarioEngineScreenEntity: Entity | null = null
    public selectStatementContainerEntity: Entity | null = null
    public textDialogMiddelware = new TextDialogMiddelware()
    public pointsUpdated = new BehaviorSubject<number>(0)
    public styleObservers = new Map<string, MutationObserver>()
    public points = new Map<string, number>()
    //przekazac do scenar
    constructor(
        private app: Application | AppBase | null,
        sceneMiddelware: SceneMiddelware,
    ) {
        this.editorContainer = this.createEditorContainer()

        this.sceneMiddelware = sceneMiddelware
        this.editor = new NodeEditor<Schemes>()
        // this.engine = new DataflowEngine<Schemes>()
        this.controlflowEngine = new ControlFlowEngine<Schemes>()
        this.dataflowEngine = new DataflowEngine<Schemes>()

        this.area = new AreaPlugin<Schemes, AreaExtra>(this.editorContainer)
        this.connection = new ConnectionPlugin<Schemes, AreaExtra>()
        this.socket = new ClassicPreset.Socket('socket')
        this.render = new ReactPlugin<Schemes, AreaExtra>({ createRoot })
        this.scopes = new ScopesPlugin<Schemes>()
        this.contextMenu = new ContextMenuPlugin<Schemes>({
            items: ContextMenuPresets.classic.setup([
                [
                    'Base',
                    [
                        ['Start', () => new StartNode(undefined, this)],
                        ['End', () => new EndNode(undefined, this)],
                        ['Perent', () => new ParentNode(undefined, this)],
                    ],
                ],
                [
                    'Dialogs',
                    [
                        ['Statement', () => new StatementNode(undefined, this)],
                        ['NPC', () => new NPCNode(undefined, this)],
                        ['Hint', () => new HintNode(undefined, this)],
                        // ['Narrator', () => new NarratorNode(undefined, this)],
                    ],
                ],

                ['Calculation', [['SummaryPoints', () => new SummaryPointsNode(undefined, this)]]],
            ]),
        })

        this.ended.subscribe((ended) => {
            this.started.next(!ended)
            if (this.scenarioEngineScreenEntity) {
                this.scenarioEngineScreenEntity.enabled = !ended
            }
        })

        this.arrange = new AutoArrangePlugin<Schemes>()
        this.arrange.addPreset(ArrangePresets.classic.setup())

        this.applier = new ArrangeAppliers.TransitionApplier({
            duration: 250,
            timingFunction: (t) => t,
            onTick: async () => {
                await this.zoomOut()
            },
        })

        this.connection.addPreset(ConnectionPresets.classic.setup())
        this.scopes.addPreset(ScopesPresets.classic.setup())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.render.addPreset((Presets.contextMenu as any).setup())
        this.render.addPreset(
            Presets.classic.setup({
                customize: {
                    control(data) {
                        if (data.payload instanceof ButtonControl) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            return CustomButton as any
                        }
                        if (data.payload instanceof LabeledInputControl) {
                            return CustomLabeledInput
                        }
                        if (data.payload instanceof LabeledTextareaControl) {
                            return CustomTextarea
                        }
                        if (data.payload instanceof SelectControl) {
                            return CustomSelect
                        }
                        if (data.payload instanceof StatementControl) {
                            return CustomStatement
                        }
                        if (data.payload instanceof ClassicPreset.InputControl) {
                            return Presets.classic.Control
                        }
                        return Presets.classic.Control
                    },
                },
            }),
        )

        this.editor.use(this.area)
        this.area.use(this.connection)
        this.area.use(this.render)
        this.area.use(this.scopes)
        this.area.use(this.arrange) // freezes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.area.use(this.contextMenu as any)
        this.editor.use(this.controlflowEngine)
        this.editor.use(this.dataflowEngine)
        this.editor.addPipe((context) => {
            if (['connectioncreated', 'connectionremoved'].includes(context.type)) {
                if (context.type === 'connectioncreated') {
                    this.editor.getNodes().forEach((node) => {
                        if (node.id === context.data.target) {
                            if (node.inputs && node.inputs[context.data.targetInput]) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ; (node.inputs as any)[context.data.targetInput].showControl = true
                            }
                            return
                        }
                    })
                }
            }
            return context
        })

        AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl(),
        })
        // AreaExtensions.simpleNodesOrder(this.area)
        AreaExtensions.showInputControl(this.area)
        // this.area.update('control', node.controls['result'].id);

        // this.pointsUpdated.subscribe((points) => {
        //     console.log('Calculated', points)
        // })
    }

    set debug(value: boolean) {
        this._debug = value
    }
    createNode(nodeDef: NodeDef) {
        let newNode = null
        if (nodeDef.nodeType === NodeTypes.StatementNode) newNode = new StatementNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.NPCNode) newNode = new NPCNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.HintNode) newNode = new HintNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.StartNode) newNode = new StartNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.SummaryPointsNode) newNode = new SummaryPointsNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.EndNode) newNode = new EndNode(nodeDef, this)
        if (nodeDef.nodeType === NodeTypes.ParentNode) newNode = new ParentNode(nodeDef, this)
        if (newNode === null) {
            throw new Error('Unknown node type')
        }

        return newNode
    }
    async start() {
        const startNode = this.editor.getNodes().find((n) => n instanceof StartNode)
        if (startNode) {
            this.controlflowEngine.execute(startNode.id)
            this.started.next(true)
            if (this.scenarioEngineScreenEntity) {
                this.scenarioEngineScreenEntity.enabled = true
            }
        }
    }
    async restart() {
        this.started.next(false)
        this.textDialogMiddelware.clearDialogs()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private updateControl(control: any) {
        this.area.update('control', control.id)
    }
    public clearDialogs() {
        this.selectStatementContainerEntity?.children.forEach((child) => {
            if (child instanceof Entity) {
                child.enabled = false
                child.destroy()
            }
        })
        this.textDialogMiddelware.clearDialogs()
    }
    public addDialog(statementDef: ControlDef, statementControlIndex: string) {
        this.textDialogMiddelware.addDialog(statementDef, statementControlIndex)

        const stB = this.createStatementButtonElement(statementDef)
        stB.enabled = true
        stB.element?.on('click', () => {
            this.textDialogMiddelware.onDialogSelected(statementDef, statementControlIndex)
        })
        stB.element?.on('mouseenter', () => {
            document.body.style.cursor = "pointer";
            this.app?.graphicsDevice.canvas.classList.add('disable-pointer-lock')
        })
        stB.element?.on('mouseleave', () => {
            document.body.style.cursor = "default";
            this.app?.graphicsDevice.canvas.classList.remove('disable-pointer-lock')
        })
        this.selectStatementContainerEntity?.addChild(stB)
    }

    public createScenarioScreenContainer() {
        const fontId = this.app?.assets.find('Courier')?.id

        // main container for main group
        this.scenarioEngineScreenEntity = new Entity('dialogContainer')
        this.scenarioEngineScreenEntity.addComponent('element', {
            opacity: 0.6,
            type: ELEMENTTYPE_TEXT,
            pivot: new Vec2(0, 0),
            anchor: new Vec4(0, 0, 0, 0),
            width: this.app?.graphicsDevice.width,
            height: 200,
            autoWidth: false,
            autoFitWidth: false,
            autoHeight: false,
            autoFitHeight: false,
            wrapLines: true,
            color: Color.WHITE,
            // enableMarkup: true,
        })

        this.scenarioEngineScreenEntity.addComponent('layoutgroup', {
            orientation: ORIENTATION_VERTICAL,
            spacing: new Vec2(10, 10),
            aligment: new Vec2(0, 1),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: FITTING_BOTH,
            heightFitting: FITTING_BOTH,
            // wrap children
            // wrap: true,
        })

        // top dialog intro text
        const dialogIntro = new Entity()
        dialogIntro.addComponent('element', {
            pivot: new Vec2(0, 0),
            anchor: new Vec4(0, 0, 0, 0),
            fontAsset: fontId,
            fontSize: 16,
            lineHeight: 16,
            text: 'Select statement to response',
            width: this.app?.graphicsDevice.width,
            autoWidth: false,
            autoFitWidth: false,
            autoHeight: true,
            autoFitHeight: false,
            wrapLines: true,
            // enableMarkup: true,
            type: ELEMENTTYPE_TEXT,
            color: Color.BLACK,
        })
        this.scenarioEngineScreenEntity.addChild(dialogIntro)

        // statemetn to select container
        this.selectStatementContainerEntity = new Entity('statementContainer')
        this.selectStatementContainerEntity.addComponent('element', {
            opacity: 0.6,
            type: ELEMENTTYPE_TEXT,
            pivot: new Vec2(0, 0),
            anchor: new Vec4(0, 0, 0, 0),
            width: this.app?.graphicsDevice.width,
            height: 50,
            autoWidth: false,
            autoFitHeight: false,
            autoHeight: false,
            autoFitWidth: false,
            wrapLines: true,
            color: Color.WHITE,
        })
        this.selectStatementContainerEntity.addComponent('layoutgroup', {
            orientation: ORIENTATION_VERTICAL,
            spacing: new Vec2(10, 10),
            aligment: new Vec2(0, 1),
            // fit_both for width and height, making all child elements take the entire space
            widthFitting: FITTING_BOTH,
            heightFitting: FITTING_NONE,
            // wrap children
            // wrap: true,
        })
        this.scenarioEngineScreenEntity.addChild(this.selectStatementContainerEntity)
        this.scenarioEngineScreenEntity.enabled = false

        this.textDialogMiddelware.dialogPlaying.subscribe((playing) => {
            if (!this.scenarioEngineScreenEntity) return
            if (playing) {
                // this.scenarioEngineScreenEntity.c.element.color = Color.RED
            } else {
                // this.scenarioEngineScreenEntity.c.element.color = Color.WHITE
            }
        })

        return this.scenarioEngineScreenEntity
    }
    private createStatementButtonElement(statementDef: ControlDef) {
        setApplication(this.app)
        const fontId = this.app?.assets.find('Courier')?.id
        const statementButton = new Entity('statementButton_' + statementDef.name)
        statementButton.setLocalPosition(0, -25, 0)
        statementButton.addComponent('button')
        statementButton.addComponent('element', {
            anchor: [0.5, 0.5, 0.5, 0.5],
            height: 50,
            autoWidth: false,
            autoFitWidth: false,
            autoHeight: false,
            autoFitHeight: false,
            pivot: [0.5, 0.5],
            type: ELEMENTTYPE_IMAGE,
            useInput: true,
            color: new Color(56 / 255, 242 / 255, 174 / 255),
        })

        const statementButtonText = new Entity('textButton_' + statementDef.name)
        statementButtonText.addComponent('element', {
            pivot: new Vec2(0.5, 0.5),
            anchor: new Vec4(0, 0, 1, 1),
            margin: new Vec4(0, 0, 0, 0),
            // color: new Color(0, 0, 0),
            fontAsset: fontId,
            fontSize: 16,
            text: statementDef.value,
            type: ELEMENTTYPE_TEXT,
            wrapLines: false,
            autoWidth: true,
            color: new Color(34 / 255, 36 / 255, 39 / 255),
            hoverTint: new Color(1 / 255, 36 / 255, 2 / 255),
        })

        statementButton.addChild(statementButtonText)

        console.log(statementButton, statementButtonText);
        return statementButton
    }
    private createEditorContainer() {
        const button = document.createElement('button')
        button.style.position = 'absolute'
        button.style.left = '20px'
        button.style.width = '80px'
        button.style.height = '40px'
        button.style.zIndex = '1292'
        button.classList.add('btn')
        button.textContent = 'Start'
        button.onclick = this.start.bind(this)
        const restart = document.createElement('button')
        restart.style.position = 'absolute'

        restart.style.left = '140px'
        restart.style.width = '80px'
        restart.style.height = '40px'
        restart.style.zIndex = '1292'
        restart.classList.add('btn')
        restart.textContent = 'Restart'
        restart.onclick = this.restart.bind(this)

        const exportJSON = document.createElement('button')
        exportJSON.style.position = 'absolute'

        exportJSON.style.left = '260px'
        exportJSON.style.width = '80px'
        exportJSON.style.height = '40px'
        exportJSON.style.zIndex = '1292'
        exportJSON.classList.add('btn')
        exportJSON.textContent = 'exportJSON'
        exportJSON.onclick = this.exportJSON.bind(this)

        const speedSpeach = document.createElement('input')
        speedSpeach.style.position = 'absolute'

        speedSpeach.style.left = '360px'
        speedSpeach.style.width = '80px'
        speedSpeach.style.height = '40px'
        speedSpeach.style.zIndex = '1292'
        speedSpeach.type = 'range'
        speedSpeach.min = '0'
        speedSpeach.max = '10'
        speedSpeach.step = '0.1'
        speedSpeach.value = this.textDialogMiddelware.dialogspeed.toString()
        speedSpeach.textContent = 'speedSpeach'
        speedSpeach.ondrag = this.onChangeSpeedSpeach.bind(this)
        speedSpeach.onchange = this.onChangeSpeedSpeach.bind(this)

        const containerWrapper = document.createElement('div') as HTMLDivElement
        containerWrapper.id = 'containerWrapper'
        containerWrapper.style.height = '100%'
        containerWrapper.style.width = '100%'

        const dialogVisualized = document.createElement('div') as HTMLDivElement
        dialogVisualized.style.position = 'absolute'
        dialogVisualized.style.height = '200px'
        dialogVisualized.style.bottom = '0px'
        dialogVisualized.style.left = '0px'
        dialogVisualized.style.right = '0px'
        dialogVisualized.style.background = '#c3c3c3'
        const editorContainer = document.createElement('div') as HTMLDivElement
        containerWrapper.appendChild(dialogVisualized)
        containerWrapper.appendChild(editorContainer)
        dialogVisualized.appendChild(button)
        dialogVisualized.appendChild(restart)
        dialogVisualized.appendChild(exportJSON)
        dialogVisualized.appendChild(speedSpeach)
        dialogVisualized.append(this.textDialogMiddelware.dom)
        containerWrapper.style.backgroundColor = 'rgb(32, 41, 43)'
        containerWrapper.style.backgroundImage =
            'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJ2LTQiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzIGlkPSJ2LTMiPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggaWQ9InYtNSIgZD0iTSAxMCAwIEgwIE0wIDAgVjAgMTAiIHN0cm9rZT0iIzBlMTkyMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXzEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cGF0aCBpZD0idi04IiBkPSJNIDEwMCAwIEgwIE0wIDAgVjAgMTAwIiBzdHJva2U9IiMwNjEwMWIiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgaWQ9InYtNyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuXzApIi8+PHJlY3QgaWQ9InYtMTAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl8xKSIvPjwvc3ZnPg==)'
        return containerWrapper
    }

    public async loadDialog(dialogUUID: string) {
        this.dialogUUID = dialogUUID
        const dialogReq = await http
            .get<DialogJson>(`/static/training-dialog/${dialogUUID}/${dialogUUID}.json?timestamp=${new Date().getTime()}`, {})
            .catch(() => {
                return {
                    data: null,
                }
            })
        if (dialogReq?.data) {
            await this.parseDialog(dialogReq.data)
            this.editor.getNodes().forEach(async (node) => {
                this.addUpdatePointsEvents(node)
                await this.updateNodesAfterCreate(node)
            })
        }

        return dialogReq
    }

    public async saveDialog() {
        const data = this.createJSON()
        await http.post(`/static/training-dialog/${this.dialogUUID}/${this.dialogUUID}.json`, new Blob([JSON.stringify(data)], { type: 'text/json' }))
    }

    public async createNewDialog(dialogUUID: string) {
        await this.editor.clear()

        this.dialogUUID = dialogUUID
        const startNode = new StartNode(undefined, this)
        await this.editor.addNode(startNode)
        await this.area.translate(startNode.id, { x: -600, y: 0 })

        const npcNode = new NPCNode(undefined, this)
        await this.editor.addNode(npcNode)
        await this.area.translate(npcNode.id, { x: -0, y: 0 })
        const c1 = new ClassicPreset.Connection(startNode, 'start', npcNode, 'execute')
        await this.editor.addConnection(c1)

        const statementNode = new StatementNode(undefined, this)
        await this.editor.addNode(statementNode)
        await this.area.translate(statementNode.id, { x: 600, y: 0 })

        const c2 = new ClassicPreset.Connection(npcNode, 'executed', statementNode, 'execute')
        await this.editor.addConnection(c2)

        const endNode = new EndNode(undefined, this)
        await this.editor.addNode(endNode)
        await this.area.translate(endNode.id, { x: 1200, y: 0 })

        const c3 = new ClassicPreset.Connection(statementNode, 'executed', endNode, 'end')
        await this.editor.addConnection(c3)

        this.editor.getNodes().forEach(async (node) => {
            this.addUpdatePointsEvents(node)
            await this.updateNodesAfterCreate(node)
        })

        this.saveDialog()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private addUpdatePointsEvents(node: any) {
        if ((node.hasControl('points') && node instanceof StatementNode) || node instanceof NPCNode) {
            node.controlsUpdated.subscribe(() => {
                if (!node.controls.points) return
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const points = (node.controls.points as any).value
                const pointsFloat = parseFloat(points)
                this.points.set(node.id, pointsFloat)
                this.pointsUpdated.next(Array.from(this.points.values()).reduce((a, b) => a + b, 0))
            })
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async updateNodesAfterCreate(node: any) {
        await this.area.update('node', node.id)
        if (node instanceof BaseNode) {
            const nodeView = this.area.nodeViews.get(node.id)
            if (nodeView) {
                node.positionChanged.next(nodeView.position)
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async parseDialog(dialogData: any) {
        await this.editor.clear()
        for (const node of dialogData.nodes) {
            const instance = this.createNode(node)
            const [x, y] = node.position

            instance.id = String(node.id)

            await this.editor.addNode(instance)
            await this.area.translate(instance.id, { x, y })

            const nodeView = this.area.nodeViews.get(instance.id)
            if (nodeView) {
                this.addStyleChangeEvent(nodeView, instance)
            }
        }
        for (const connection of dialogData.connections) {
            try {
                const sourceNode = this.editor.getNode(String(connection.source))
                const targetNode = this.editor.getNode(String(connection.target))
                if (sourceNode === null || targetNode === null) {
                    console.log(`Connection cant be created `, connection)
                    continue
                }
                const c = new ClassicPreset.Connection(sourceNode, connection.sourceOutput, targetNode, connection.targetInput)
                await this.editor.addConnection(c)
            } catch (e) {
                console.log(e)
            }
        }

        setTimeout(async () => {
            // wait until nodes rendered because they dont have predefined width and height
            // await this.arrangeNodes()
            await this.zoomOut()
        }, 100)
    }
    public async zoomOut() {
        await AreaExtensions.zoomAt(this.area, this.editor.getNodes())
    }
    // public async arrangeNodes() {
    //     await this.arrange.layout({
    //         applier: this.applier,
    //         options: {
    //             'elk.spacing.nodeNode': '300',
    //             'elk.childAreaHeight': '1000',
    //             'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    //         },
    //     })
    // }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private addStyleChangeEvent(node: NodeView, nodeInstance: any) {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function () {
                if (nodeInstance instanceof BaseNode) {
                    nodeInstance.positionChanged.next(node.position)
                }
            })
        })
        observer.observe(node.element, { attributes: true, attributeFilter: ['style'] })
        this.styleObservers.set(nodeInstance.id, observer)
    }

    public createJSON() {
        const data: DialogJson = {
            scenario: {
                language: 'pl',
                name: 'Test export',
                uuid: this.dialogUUID,
            },
            nodes: [],
            connections: [],
        }
        const connections = this.editor.getConnections()
        data.connections = connections

        const nodes = this.editor.getNodes()
        for (const node of nodes) {
            if (node instanceof BaseNode) {
                const nodeDef = node.exportToJson()
                nodeDef && data.nodes.push(nodeDef)
            }
        }
        return data
    }

    public exportJSON() {
        const data = this.createJSON()
        const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })
        window.open(URL.createObjectURL(blob), '_blank')
        // saveAs(blob, `${this.dialogUUID}.json`)
    }
    public onChangeSpeedSpeach(e: any) {
        e.preventDefault()
        e.stopPropagation()
        this.textDialogMiddelware.dialogspeed = e.target.value
    }
}
