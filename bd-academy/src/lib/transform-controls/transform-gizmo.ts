// gizmomaterial function return class witchi extends standard material in playcanvas
// https://github.com/rollup/three-jsnext/blob/master/examples/js/controls/TransformControls.js#L9

import { Application, BLEND_NORMAL, BODYTYPE_STATIC, CollisionComponent, Entity, Layer, Mesh, MeshInstance, Vec2, Vec3, createPlane } from 'playcanvas'
import GizmoMaterial from './gizmo-material'
import { traverse } from '../utils/playcanvas-utils'
export enum GIZMO_AXIS {
    X = 'X',
    Y = 'Y',
    Z = 'Z',
}
export enum GIZMO_PLANES {
    XYZE = 'XYZE',
    XYZ = 'XYZ',
    XY = 'XY',
    YZ = 'YZ',
    XZ = 'XZ',
}
export default class TransformGizmo {
    // public transparent: boolean
    private planeMesh: Mesh
    private _activePlane: Entity | null = null
    //material do widocznych plaszcyzn i geometri
    protected handleMaterial = new GizmoMaterial()
    //plane geometry material ale tylko do raycastingu czyli planes
    protected planeMaterial = new GizmoMaterial({ opacity: 0 })
    // picker do cylindow okreslajacych pole do zaznacznia
    protected pickerMaterial = new GizmoMaterial({ opacity: 0 })
    protected planeInstance = new Map<string, Entity>()

    // geometria strzalek i lini,sfet i plaszczyzn
    public handles = new Entity('render')
    // kontener do handlesow do zaznacznia elementow
    public pickers = new Entity('render')
    //elements to project mouse position
    public planes = new Entity('render')
    private _visible = false
    public gizmo = new Entity()
    public gizmoContainer = new Entity('render')
    public _selectedObject: Entity | null = null
    public app: Application
    public entity: Entity
    private gizmoLayer: Layer | null = null

    constructor(parameters: { app: Application; entity: Entity }) {
        this.gizmo.name = 'gizmo'
        this.gizmoContainer.name = 'gizmoContainer'
        this.app = parameters.app
        this.entity = parameters.entity
        this.gizmo.setGuid('30182ee4-a4e2-4421-b2e2-0946c31f6411')
        this.planeMesh = createPlane(parameters.app.graphicsDevice, {
            halfExtents: new Vec2(1000, 1000),
            widthSegments: 1,
            lengthSegments: 1,
        })

        this.handleMaterial.name = 'handlesMaterial'
        this.pickerMaterial.name = 'pickerMaterial'
        this.pickerMaterial.cull = 0
        this.pickerMaterial.blendType = BLEND_NORMAL
        this.pickerMaterial.update()

        this.init()
    }
    set visible(visible: boolean) {
        this._visible = visible
        this.gizmo.enabled = visible
    }

    get activePlane() {
        return this._activePlane
    }
    set activePlane(activePlane: Entity | null) {
        this._activePlane = activePlane
    }
    get visible() {
        return this._visible
    }

    set selectedObject(object: Entity | null) {
        this._selectedObject = object
        this.setGizmoContainerPosition()
    }

    public setGizmoContainerPosition = () => {
        if (!this._selectedObject) return
        this.gizmoContainer.setPosition(this._selectedObject.getPosition().clone())
    }
    public setGizmoContainerScale = (scale: Vec3) => {
        this.gizmoContainer.setLocalScale(scale)
    }

    private createLayer = (name: string) => {
        const existing = this.app.scene.layers.getLayerByName(name)
        if (existing) {
            this.gizmoLayer = existing
            return
        }
        const worldLayer = this.app.scene.layers.getLayerByName('World')
        if (!worldLayer) return
        const idx = this.app.scene.layers.getTransparentIndex(worldLayer)

        this.gizmoLayer = new Layer({
            name: name,
            // opaqueSortMode : SORTMODE_NONE,
        })

        //add camera to gizmo layer
        this.app.scene.layers.insert(this.gizmoLayer, idx + 1)
        if (this.entity.camera?.layers) {
            const layers = [...this.entity.camera?.layers]
            layers.push(this.gizmoLayer.id)
            this.entity.camera.layers = layers
        }
    }
    private init = () => {
        this.createLayer('gizmo')
        this.handles.name = 'handles'
        this.pickers.name = 'pickers'
        this.planes.name = 'planes'
        this.handles.setGuid('6d99d304-f927-4948-937a-425c5eca6a33')
        this.pickers.setGuid('33533065-0efb-477a-a94b-f27bce3560a2')
        this.planes.setGuid('9fb9b323-6e16-42f4-bc07-0a9137f944cc')
        //planes to intersect

        const planesMaterials = {
            XY: this.planeMaterial.clone(),
            YZ: this.planeMaterial.clone(),
            XZ: this.planeMaterial.clone(),
            // XYZE: this.planeMaterial.clone(),
        }
        //debug visible planes
        // planesMaterials.XZ.color.a = 0.5
        // planesMaterials.XZ.color.r = 1

        const planes = {
            XY: new MeshInstance(this.planeMesh, planesMaterials.XY),
            YZ: new MeshInstance(this.planeMesh, planesMaterials.YZ),
            XZ: new MeshInstance(this.planeMesh, planesMaterials.XZ),
            // XYZE: new MeshInstance(this.planeMesh, planesMaterials.XYZE),
        }
        const planesEntity = {
            XY: new Entity('XY'),
            YZ: new Entity('YZ'),
            XZ: new Entity('XZ'),
            // XYZE: new Entity('XYZE'),
        }
        planes.XY.pick = false
        planes.YZ.pick = false
        planes.XZ.pick = false

        planesEntity.XY.setEulerAngles(90, 0, 0)
        planesEntity.YZ.setEulerAngles(0, 0, -90)

        //ttemp disable visibility
        Object.values(planesEntity).forEach((planeEntity) => {
            ;(planeEntity as Entity).enabled = true
            // ;(planeEntity as Entity).render?.show()
            //set layers to gizmolayers only
            if (planeEntity.name === GIZMO_PLANES.XY) {
                planeEntity.addComponent('render', { meshInstances: [planes.XY], layers: [] })
            } else if (planeEntity.name === GIZMO_PLANES.YZ) {
                planeEntity.addComponent('render', { meshInstances: [planes.YZ], layers: [] })
            } else if (planeEntity.name === GIZMO_PLANES.XZ) {
                planeEntity.addComponent('render', { meshInstances: [planes.XZ], layers: [] })
            } else if (planeEntity.name === GIZMO_PLANES.XYZE) {
                // planesEntity.XYZE.addComponent('render', { meshInstances: [planes.XYZE] })
            }

            this.assingGizmoLayer(planeEntity)

            // add element to colision
            //performence issue - collision with all
            if (planeEntity.collision === undefined) {
                const collision = planeEntity.addComponent('collision', {
                    type: 'box',
                })
                if (collision) {
                    if (collision instanceof CollisionComponent) {
                        collision.halfExtents = this.planeMesh.aabb.halfExtents.clone()
                    }
                }
            }
            if (planeEntity.rigidbody === undefined) {
                planeEntity.addComponent('rigidbody', {
                    type: BODYTYPE_STATIC,
                })
            }
            planeEntity.tags.add('gizmo_plane')
            planeEntity.tags.add('plane')
            planeEntity.tags.add(planeEntity.name)

            this.planes.addChild(planeEntity)
        })

        this.planeInstance.set('XY', planesEntity.XY)
        this.planeInstance.set('YZ', planesEntity.YZ)
        this.planeInstance.set('XZ', planesEntity.XZ)
        // this.planeInstance.set('XYZE', planesEntity.XYZE)

        // this._activePlane = planesEntity.XYZE

        this.gizmoContainer.addChild(this.pickers)
        this.gizmoContainer.addChild(this.handles)
        this.gizmo.addChild(this.planes)
        this.gizmo.addChild(this.gizmoContainer)

        traverse(this.gizmo, (child) => {
            if ((child as any).render) {
                child.setPosition(0, 0, 0)
                child.setLocalScale(1, 1, 1)
            }
        })
    }

    public update = () => {}

    public assingGizmoLayer = (entity: Entity) => {
        if (!entity.render) return
        if (!this.gizmoLayer) return
        const layers = [...entity.render.layers]
        layers.push(this.gizmoLayer.id)
        entity.render.layers = layers
    }
}
