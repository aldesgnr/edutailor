import {
    Application,
    BLEND_NORMAL,
    BODYTYPE_STATIC,
    CollisionComponent,
    Color,
    Entity,
    Mat4,
    Mesh,
    MeshInstance,
    Quat,
    Vec2,
    Vec3,
    createBox,
    createCylinder,
    createPlane,
} from 'playcanvas'
import { GIZMO_BLUE, GIZMO_GREEN, GIZMO_RED } from './gizmo-material'
import TransformGizmo, { GIZMO_AXIS, GIZMO_PLANES } from './transform-gizmo'

export default class TransformGizmoScale extends TransformGizmo {
    public type: string = 'scale'
    private _scaleBoxMesh: Mesh | null = null
    private _scaleLineMesh: Mesh | null = null
    private _planeMesh: Mesh | null = null
    private _pickerBoxGeometry: Mesh | null = null
    private _pickerPlaneGeometry: Mesh | null = null
    constructor(parameters: { app: Application; entity: Entity }) {
        super(parameters)
        this.app = parameters.app
        this.gizmo.name = 'scale'

        this.crateBoxes()
        this.createPlanes()
        this.createPlanesPickerContainer()
        this.crateAxisPickerContainer()
    }
    public crateAxisPickerContainer() {
        this._pickerBoxGeometry = createBox(this.app.graphicsDevice, {
            halfExtents: new Vec3(0.1, 0.6, 0.1),
            widthSegments: 1,
            lengthSegments: 1,
            heightSegments: 1,
            // calculateTangents: boolean,
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

        // const pickerMaterial = this.pickerMaterial
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
                type: BODYTYPE_STATIC,
            })
        }

        return pickerEntity
    }

    public createAxisPickerEntity(axis: GIZMO_AXIS) {
        if (!this._pickerBoxGeometry) throw new Error('pickerCylinderGeometry is not defined')

        // const pickerMaterial = this.pickerMaterial
        // pickerMaterial.name = `pickerMaterial_${axis}`
        const pickerEntity = new Entity('render')
        pickerEntity.name = `PICKER_CONTAINER_${axis}`
        pickerEntity.tags.add('gizmo')
        pickerEntity.tags.add('picker')
        pickerEntity.tags.add('axis')
        pickerEntity.tags.add(axis)

        pickerEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._pickerBoxGeometry, this.pickerMaterial)],
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
                type: 'box',
            })

            if (collision) {
                if (collision instanceof CollisionComponent) {
                    collision.halfExtents = this._pickerBoxGeometry.aabb.halfExtents.clone()
                }
            }
        }
        if (pickerEntity.rigidbody === undefined) {
            pickerEntity.addComponent('rigidbody', {
                type: BODYTYPE_STATIC,
            })
        }

        return pickerEntity
    }

    public crateBoxes() {
        this._scaleBoxMesh = createBox(this.app.graphicsDevice, {
            halfExtents: new Vec3(0.1, 0.1, 0.1),
            widthSegments: 1,
            lengthSegments: 1,
            heightSegments: 1,
        })
        this._scaleLineMesh = createCylinder(this.app.graphicsDevice, {
            radius: 0.01,
            height: 1,
            heightSegments: 1,
            capSegments: 12,
        })
        const entityX = this.createBoxEntity(GIZMO_AXIS.X)
        const entityY = this.createBoxEntity(GIZMO_AXIS.Y)
        const entityZ = this.createBoxEntity(GIZMO_AXIS.Z)

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
        handlePlaneMaterial.name = `SCALE_handlePlaneMaterial_${axis}`
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
    public createBoxEntity(axis: GIZMO_AXIS) {
        if (!this._scaleBoxMesh) throw new Error('scaleBoxMesh is not defined')
        if (!this._scaleLineMesh) throw new Error('scaleLineMesh is not defined')

        const boxMaterial = this.handleMaterial.clone()
        boxMaterial.name = `boxMaterial_${axis}`

        if (axis === GIZMO_AXIS.X) {
            boxMaterial.changeColor(GIZMO_RED)
        } else if (axis === GIZMO_AXIS.Y) {
            boxMaterial.changeColor(GIZMO_GREEN)
        } else if (axis === GIZMO_AXIS.Z) {
            boxMaterial.changeColor(GIZMO_BLUE)
        }

        const axisContainer = new Entity('render')
        axisContainer.name = `AXIS_CONTAINER_${axis}`
        axisContainer.tags.add('axis')
        axisContainer.tags.add(axis)
        const scaleLineEntity = new Entity('render')
        scaleLineEntity.name = `AXIS_LINE_${axis}`
        scaleLineEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._scaleLineMesh, boxMaterial)],
            layers: [],
        })
        const scaleBoxEntity = new Entity('render')
        scaleBoxEntity.name = `AXIS_BOX_${axis}`
        scaleBoxEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._scaleBoxMesh, boxMaterial)],
            layers: [],
        })

        this.assingGizmoLayer(scaleLineEntity)
        this.assingGizmoLayer(scaleBoxEntity)

        axisContainer.addChild(scaleLineEntity)
        axisContainer.addChild(scaleBoxEntity)

        if (axis === GIZMO_AXIS.X) {
            scaleBoxEntity.translate(0.6, 0, 0)
            axisContainer.translate(0.5, 0, 0)
            scaleBoxEntity.setEulerAngles(0, 0, -90)
            scaleLineEntity.setEulerAngles(0, 0, -90)
        } else if (axis === GIZMO_AXIS.Y) {
            scaleBoxEntity.translate(0, 0.6, 0)
            axisContainer.translate(0, 0.5, 0)
            scaleBoxEntity.setEulerAngles(0, 90, 0)
            scaleLineEntity.setEulerAngles(0, 90, 0)
        } else if (axis === GIZMO_AXIS.Z) {
            scaleBoxEntity.translate(0, 0, 0.6)
            axisContainer.translate(0, 0, 0.5)
            scaleBoxEntity.setEulerAngles(90, 0, 0)
            scaleLineEntity.setEulerAngles(90, 0, 0)
        }

        return axisContainer
    }
    setGizmoContainerRotation = (rotation: Quat) => {
        this.gizmoContainer.setRotation(rotation)
    }

    setActivePlane(axis: GIZMO_AXIS | GIZMO_PLANES, eye: Vec3) {
        var tempMatrix = new Mat4()
        const planeXY = this.planes.findByName('XY')
        // eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

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
