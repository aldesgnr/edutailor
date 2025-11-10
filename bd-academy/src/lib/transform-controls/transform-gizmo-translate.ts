import {
    Application,
    BLEND_NORMAL,
    BODYTYPE_KINEMATIC,
    CollisionComponent,
    Color,
    Entity,
    Mat4,
    Mesh,
    MeshInstance,
    Vec2,
    Vec3,
    createCone,
    createCylinder,
    createPlane,
} from 'playcanvas'
import { GIZMO_BLUE, GIZMO_GREEN, GIZMO_RED } from './gizmo-material'
import TransformGizmo, { GIZMO_AXIS, GIZMO_PLANES } from './transform-gizmo'

export default class TransformGizmoTranslate extends TransformGizmo {
    public type: string = 'translate'
    private _arrowConeMesh: Mesh | null = null
    private _arrowLineMesh: Mesh | null = null
    private _planeMesh: Mesh | null = null
    private _pickerCylinderGeometry: Mesh | null = null
    private _pickerPlaneGeometry: Mesh | null = null

    constructor(parameters: { app: Application; entity: Entity }) {
        super(parameters)
        this.app = parameters.app
        this.gizmo.name = 'translate'

        this.crateArrows()
        this.createPlanes()
        this.createPlanesPickerContainer()
        this.crateAxisPickerContainer()
        //todo try to fix planes
    }

    //method to create picker container add to pickers, use picker material
    public crateAxisPickerContainer() {
        this._pickerCylinderGeometry = createCylinder(this.app.graphicsDevice, {
            radius: 0.1,
            height: 1 + 0.2,
            heightSegments: 1,
            capSegments: 12,
        })

        const entityX = this.createAxisPickerEntity(GIZMO_AXIS.X)
        const entityY = this.createAxisPickerEntity(GIZMO_AXIS.Y)
        const entityZ = this.createAxisPickerEntity(GIZMO_AXIS.Z)
        if (this.pickers) {
            this.pickers.addChild(entityX)
            this.pickers.addChild(entityY)
            this.pickers.addChild(entityZ)
        }
    }
    public createPlanesPickerContainer() {
        this._pickerPlaneGeometry = createPlane(this.app.graphicsDevice, {
            halfExtents: new Vec2(0.3, 0.3),
            widthSegments: 1,
            lengthSegments: 1,
        })

        const entityXY = this.createPlanePickerEntity(GIZMO_PLANES.XY)
        const entityYZ = this.createPlanePickerEntity(GIZMO_PLANES.YZ)
        const entityXZ = this.createPlanePickerEntity(GIZMO_PLANES.XZ)
        if (this.pickers) {
            this.pickers.addChild(entityXY)
            this.pickers.addChild(entityYZ)
            this.pickers.addChild(entityXZ)
        }
    }
    public createPlanePickerEntity(axis: GIZMO_PLANES) {
        if (!this._pickerPlaneGeometry) throw new Error('pickerPlaneGeometry is not defined')

        // pickerMaterial.name = `pickerMaterial_${axis}`
        const pickerEntity = new Entity('render')
        pickerEntity.name = `PICKER_PLANE_CONTAINER_${axis}`
        pickerEntity.tags.add('gizmo')
        pickerEntity.tags.add('picker')
        pickerEntity.tags.add('plane')
        pickerEntity.tags.add(axis)

        pickerEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._pickerPlaneGeometry, this.pickerMaterial)],
            layers: [],
        })

        if (axis === GIZMO_PLANES.XY) {
            pickerEntity.translate(0.4, 0.4, 0)
            pickerEntity.rotateLocal(90, 0, 0)
        } else if (axis === GIZMO_PLANES.YZ) {
            pickerEntity.translate(0, 0.4, 0.4)
            pickerEntity.rotateLocal(90, 90, 0)
        } else if (axis === GIZMO_PLANES.XZ) {
            pickerEntity.translate(0.4, 0, 0.4)
            pickerEntity.rotateLocal(0, 0, 0)
        } else if (axis === GIZMO_PLANES.XYZ) {
        }

        this.assingGizmoLayer(pickerEntity)
        // add element to colision
        if (pickerEntity.collision === undefined) {
            let collision = pickerEntity.addComponent('collision', {
                type: 'box',
            })
            if (collision) {
                if (collision instanceof CollisionComponent) {
                    collision.halfExtents = this._pickerPlaneGeometry.aabb.halfExtents.clone()
                }
            }
        }
        if (pickerEntity.rigidbody === undefined) {
            pickerEntity.addComponent('rigidbody', {
                type: BODYTYPE_KINEMATIC, // if static dont move rigdbody, if kinematic is working, try to use picker instead of rigidbody -> https://developer.playcanvas.com/en/api/pc.Picker.html#prepare
            })
        }

        return pickerEntity
    }
    public createAxisPickerEntity(axis: GIZMO_AXIS) {
        if (!this._pickerCylinderGeometry) throw new Error('pickerCylinderGeometry is not defined')

        const pickerEntity = new Entity('render')
        pickerEntity.name = `PICKER_CONTAINER_${axis}`
        pickerEntity.tags.add('gizmo')
        pickerEntity.tags.add('picker')
        pickerEntity.tags.add('axis')
        pickerEntity.tags.add(axis)

        pickerEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._pickerCylinderGeometry, this.pickerMaterial)],
            layers: [],
        })

        if (axis === GIZMO_AXIS.X) {
            pickerEntity.translate(0.6, 0, 0)
            pickerEntity.setEulerAngles(0, 0, -90)
        } else if (axis === GIZMO_AXIS.Y) {
            pickerEntity.translate(0, 0.6, 0)
        } else if (axis === GIZMO_AXIS.Z) {
            pickerEntity.translate(0, 0, 0.6)
            pickerEntity.setEulerAngles(90, 0, 0)
        }

        this.assingGizmoLayer(pickerEntity)

        // add element to colision
        if (pickerEntity.collision === undefined) {
            let collision = pickerEntity.addComponent('collision', {
                type: 'cylinder',
                radius: 0.1,
                height: 1 + 0.2,
            })

            if (collision) {
                if (collision instanceof CollisionComponent) {
                    collision.height = this._pickerCylinderGeometry.aabb.halfExtents.y * 2
                    collision.radius = this._pickerCylinderGeometry.aabb.halfExtents.x
                }
            }
        }
        if (pickerEntity.rigidbody === undefined) {
            pickerEntity.addComponent('rigidbody', {
                type: BODYTYPE_KINEMATIC,
            })
        }

        return pickerEntity
    }

    public crateArrows() {
        this._arrowConeMesh = createCone(this.app.graphicsDevice, {
            baseRadius: 0.05,
            peakRadius: 0,
            height: 0.2,
            heightSegments: 1,
            capSegments: 12,
        })
        this._arrowLineMesh = createCylinder(this.app.graphicsDevice, {
            radius: 0.01,
            height: 1,
            heightSegments: 1,
            capSegments: 12,
        })

        const entityX = this.createArrowEntity(GIZMO_AXIS.X)
        const entityY = this.createArrowEntity(GIZMO_AXIS.Y)
        const entityZ = this.createArrowEntity(GIZMO_AXIS.Z)

        if (this.handles) {
            this.handles.addChild(entityX)
            this.handles.addChild(entityY)
            this.handles.addChild(entityZ)
        }
    }
    public createPlanes() {
        this._planeMesh = createPlane(this.app.graphicsDevice, {
            halfExtents: new Vec2(0.25, 0.25),
            widthSegments: 1,
            lengthSegments: 1,
        })

        const entityXY = this.createPlaneEntity(GIZMO_PLANES.XY)
        const entityYZ = this.createPlaneEntity(GIZMO_PLANES.YZ)
        const entityXZ = this.createPlaneEntity(GIZMO_PLANES.XZ)
        const entityXYZ = this.createPlaneEntity(GIZMO_PLANES.XYZ)
        if (this.handles) {
            this.handles.addChild(entityXY)
            this.handles.addChild(entityYZ)
            this.handles.addChild(entityXZ)
            // this.handles.addChild(entityXYZ)// need to add
        }
    }
    public createPlaneEntity(axis: GIZMO_PLANES) {
        if (!this._planeMesh) throw new Error('planeMesh is not defined')

        const handlePlaneMaterial = this.handleMaterial.clone()
        handlePlaneMaterial.name = `TRANSLATE_handlePlaneMaterial_${axis}`
        handlePlaneMaterial.cull = 0
        handlePlaneMaterial.blendType = BLEND_NORMAL
        if (axis === GIZMO_PLANES.XY) {
            handlePlaneMaterial.changeColor(GIZMO_BLUE.clone())
        } else if (axis === GIZMO_PLANES.YZ) {
            handlePlaneMaterial.changeColor(GIZMO_RED.clone())
        } else if (axis === GIZMO_PLANES.XZ) {
            handlePlaneMaterial.changeColor(GIZMO_GREEN.clone())
        } else if (axis === GIZMO_PLANES.XYZ) {
            handlePlaneMaterial.changeColor(new Color(1, 1, 1, 1))
        }

        const planeEntity = new Entity('render')
        planeEntity.name = `PLANE_${axis}`
        planeEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._planeMesh, handlePlaneMaterial)],
            layers: [],
        })
        planeEntity.tags.add('gizmo')
        planeEntity.tags.add('handles')
        planeEntity.tags.add('plane')
        planeEntity.tags.add(axis)

        this.assingGizmoLayer(planeEntity)

        if (axis === GIZMO_PLANES.XY) {
            planeEntity.translate(0.4, 0.4, 0)
            planeEntity.rotateLocal(90, 0, 0)
        } else if (axis === GIZMO_PLANES.YZ) {
            planeEntity.translate(0, 0.4, 0.4)
            planeEntity.rotateLocal(90, 90, 0)
        } else if (axis === GIZMO_PLANES.XZ) {
            planeEntity.translate(0.4, 0, 0.4)
            planeEntity.rotateLocal(0, 0, 0)
        } else if (axis === GIZMO_PLANES.XYZ) {
        }

        return planeEntity
    }
    public createArrowEntity(axis: GIZMO_AXIS) {
        if (!this._arrowConeMesh) throw new Error('arrowConeMesh is not defined')
        if (!this._arrowLineMesh) throw new Error('arrowConeMesh is not defined')

        const arrowMaterial = this.handleMaterial.clone()
        arrowMaterial.name = `arrowMaterial_${axis}`

        if (axis === GIZMO_AXIS.X) {
            arrowMaterial.changeColor(GIZMO_RED.clone())
        } else if (axis === GIZMO_AXIS.Y) {
            arrowMaterial.changeColor(GIZMO_GREEN.clone())
        } else if (axis === GIZMO_AXIS.Z) {
            arrowMaterial.changeColor(GIZMO_BLUE.clone())
        }

        const axisContainer = new Entity('render')
        axisContainer.name = `AXIS_CONTAINER_${axis}`
        axisContainer.tags.add('axis')
        axisContainer.tags.add(axis)
        const arrowLineEntity = new Entity('render')
        arrowLineEntity.name = `AXIS_LINE_${axis}`

        arrowLineEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._arrowLineMesh, arrowMaterial)],
            layers: [],
        })
        const arrowConeEntity = new Entity('render')
        arrowConeEntity.name = `AXIS_CONE_${axis}`
        arrowConeEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._arrowConeMesh, arrowMaterial)],
            layers: [],
        })

        this.assingGizmoLayer(arrowLineEntity)
        this.assingGizmoLayer(arrowConeEntity)

        axisContainer.addChild(arrowLineEntity)
        axisContainer.addChild(arrowConeEntity)
        if (axis === GIZMO_AXIS.X) {
            arrowConeEntity.translate(0.6, 0, 0)
            axisContainer.translate(0.5, 0, 0)
            arrowConeEntity.setEulerAngles(0, 0, -90)
            arrowLineEntity.setEulerAngles(0, 0, -90)
        } else if (axis === GIZMO_AXIS.Y) {
            arrowConeEntity.translate(0, 0.6, 0)
            axisContainer.translate(0, 0.5, 0)
            arrowConeEntity.setEulerAngles(0, 90, 0)
            arrowLineEntity.setEulerAngles(0, 90, 0)
        } else if (axis === GIZMO_AXIS.Z) {
            arrowConeEntity.translate(0, 0, 0.6)
            axisContainer.translate(0, 0, 0.5)
            arrowConeEntity.setEulerAngles(90, 0, 0)
            arrowLineEntity.setEulerAngles(90, 0, 0)
        }

        return axisContainer
    }

    setActivePlane(axis: GIZMO_AXIS | GIZMO_PLANES | any, eye: Vec3) {
        var tempMatrix = new Mat4()
        const planeXY = this.planes.findByName('XY')
        if (axis === 'X') {
            const planeToActivate = this.planes.findByName('XY')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
            if (Math.abs(eye.y) > Math.abs(eye.z)) {
                const planeToActivate = this.planes.findByName('XZ')
                if (planeToActivate) this.activePlane = planeToActivate as Entity
            }
        }

        if (axis === 'Y') {
            const planeToActivate = this.planes.findByName('XY')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
            if (Math.abs(eye.x) > Math.abs(eye.z)) {
                const planeToActivate = this.planes.findByName('YZ')
                if (planeToActivate) this.activePlane = planeToActivate as Entity
            }
        }

        if (axis === 'Z') {
            const planeToActivate = this.planes.findByName('XZ')
            if (planeToActivate) this.activePlane = planeToActivate as Entity

            if (Math.abs(eye.x) > Math.abs(eye.y)) {
                const planeToActivate = this.planes.findByName('YZ')
                if (planeToActivate) this.activePlane = planeToActivate as Entity
            }
        }

        if (axis === 'XYZ') {
            const planeToActivate = this.planes.findByName('XYZE')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'XY') {
            const planeToActivate = this.planes.findByName('XY')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'YZ') {
            const planeToActivate = this.planes.findByName('YZ')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'XZ') {
            const planeToActivate = this.planes.findByName('XZ')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }
    }
}
