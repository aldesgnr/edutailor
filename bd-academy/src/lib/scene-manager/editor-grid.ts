import { AppBase, Application, BasicMaterial, Entity, Layer, Mesh, MeshInstance, PRIMITIVE_LINES, ScriptType, Vec4 } from 'playcanvas'
import { vec4toArr } from '../utils/playcanvas-utils'

export default class EditorGrid extends ScriptType {
    private _gridCellWidth = 1
    private _gridSize = 10
    private _gridColor = new Vec4(125, 125, 125, 255)
    private _axisColor = new Vec4(0, 0, 0, 1)
    private _gridMaterial = new BasicMaterial()
    private _visible = true
    private _app: Application | AppBase
    private _gridEntity: Entity = new Entity()
    private _entity
    private _gridMeshInstance: MeshInstance | null = null
    private _gridMesh: Mesh | null = null
    private _gridLayer: Layer | null = null
    constructor(args: { app: Application; entity: Entity; attributes: any }) {
        super(args)
        this._app = args.app
        this._entity = args.entity
        this._gridEntity.tags.add('grid')
    }

    set gridCellWidth(cellWidth: number) {
        this._gridCellWidth = cellWidth
        this.resizeGrid()
    }
    set gridSize(gridSize: number) {
        this._gridSize = gridSize
        this.resizeGrid()
    }
    set gridColor(gridColor: Vec4) {
        this._gridColor = gridColor
        this.resizeGrid()
    }

    set visible(visible: boolean) {
        this._visible = visible
        this.entity.enabled = visible
        if (this.entity.render) {
            this.entity.render.enabled = visible
        }
    }
    public initialize = () => {
        this._gridEntity.name = 'grid'

        this._createGridMesh()
        // const mainScene = this.app.root.findByName('mainScene')
        // if (mainScene) {
        //     mainScene.addChild(this._gridEntity)
        // }
    }

    private _createLayer(name: string) {
        const existing = this._app.scene.layers.getLayerByName(name)
        if (existing) {
            this._gridLayer = existing
            return
        }
        const worldLayer = this._app.scene.layers.getLayerByName('World')
        if (!worldLayer) return
        const idx = this._app.scene.layers.getTransparentIndex(worldLayer)

        this._gridLayer = new Layer({
            name: name,
            // opaqueSortMode : SORTMODE_NONE,
        })

        //add camera to gizmo layer
        this._app.scene.layers.insert(this._gridLayer, idx + 1)
        if (this._entity.camera?.layers) {
            const layers = [...this._entity.camera?.layers]
            layers.push(this._gridLayer.id)
            this._entity.camera.layers = layers
        }
    }
    private _createGridMesh() {
        this._createLayer('grid')

        const gridColorArr = vec4toArr(this._gridColor)
        const axisColorArr = vec4toArr(this._axisColor)
        const vertexPositions = []
        const vertexColors = []
        const gridWidth = this._gridCellWidth * this._gridSize
        const material = this._gridMaterial
        material.vertexColors = true

        for (let i = -(this._gridSize / 2); i <= this._gridSize / 2; i++) {
            const gridCellColor = i === 0 ? axisColorArr : gridColorArr

            vertexPositions.push(-gridWidth / 2, 0, i * this._gridCellWidth)
            vertexColors.push(...gridCellColor)
            vertexPositions.push(gridWidth / 2, 0, i * this._gridCellWidth)
            vertexColors.push(...gridCellColor)
            vertexPositions.push(i * this._gridCellWidth, 0, -gridWidth / 2)
            vertexColors.push(...gridCellColor)
            vertexPositions.push(i * this._gridCellWidth, 0, gridWidth / 2)
            vertexColors.push(...gridCellColor)
        }
        this._gridMesh = new Mesh(this._app.graphicsDevice)
        this._gridMesh.setPositions(vertexPositions)
        this._gridMesh.setColors32(vertexColors)
        this._gridMesh.update(PRIMITIVE_LINES, true)
        this._gridMeshInstance = new MeshInstance(this._gridMesh, material)
        this._gridEntity.addComponent('render', {
            meshInstances: [this._gridMeshInstance],
        })
        this._gridMeshInstance.pick = false
        this._gridLayer?.addMeshInstances([this._gridMeshInstance])
    }
    public resizeGrid = () => {
        if (this._gridMeshInstance) {
            this._gridLayer?.removeMeshInstances([this._gridMeshInstance])
            this._gridEntity.removeComponent('render')
        }
        this._createGridMesh()
    }
}
