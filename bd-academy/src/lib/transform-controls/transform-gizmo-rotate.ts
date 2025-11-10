import { BODYTYPE_STATIC, CollisionComponent, Entity, Mesh, MeshInstance, Vec3, createTorus } from 'playcanvas'
import { GIZMO_BLUE, GIZMO_GREEN, GIZMO_RED } from './gizmo-material'
import TransformGizmo, { GIZMO_AXIS, GIZMO_PLANES } from './transform-gizmo'

export default class TransformGizmoRotate extends TransformGizmo {
    public type: string = 'rotate'
    private _rotateSphereMesh: Mesh | null = null
    private _pickerSphereContainerMesh: Mesh | null = null

    constructor(parameters: { app: pc.Application; entity: pc.Entity }) {
        super(parameters)
        this.app = parameters.app
        this.gizmo.name = 'rotate'

        this.crateSpheres()
        this.crateAxisPickerContainer()
    }

    public crateAxisPickerContainer() {
        this._pickerSphereContainerMesh = createTorus(this.app.graphicsDevice, {
            tubeRadius: 0.05,
            ringRadius: 0.5,
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
    public createAxisPickerEntity(axis: GIZMO_AXIS) {
        if (!this._pickerSphereContainerMesh) throw new Error('pickerSphereContainerMesh is not defined')

        const pickerMaterial = this.pickerMaterial.clone()
        pickerMaterial.name = `ROTATE_pickerMaterial_${axis}`

        const pickerEntity = new Entity('render')
        pickerEntity.name = `PICKER_CONTAINER_${axis}`
        pickerEntity.tags.add('gizmo')
        pickerEntity.tags.add('picker')
        pickerEntity.tags.add('axis')
        pickerEntity.tags.add(axis)

        pickerEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._pickerSphereContainerMesh, pickerMaterial)],
            layers: [],
        })

        if (axis === GIZMO_AXIS.X) {
            pickerEntity.setEulerAngles(0, 0, -90)
        } else if (axis === GIZMO_AXIS.Y) {
            pickerEntity.setEulerAngles(90, 0, 0)
        } else if (axis === GIZMO_AXIS.Z) {
            // pickerEntity.setEulerAngles(0, 0, 0)
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
                    collision.height = this._pickerSphereContainerMesh.aabb.halfExtents.y * 2
                    collision.radius = this._pickerSphereContainerMesh.aabb.halfExtents.x
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

    public crateSpheres() {
        this._rotateSphereMesh = createTorus(this.app.graphicsDevice, {
            tubeRadius: 0.01,
            ringRadius: 0.5,
        })
        const entityX = this.createSphereEntity(GIZMO_AXIS.X)
        const entityY = this.createSphereEntity(GIZMO_AXIS.Y)
        const entityZ = this.createSphereEntity(GIZMO_AXIS.Z)

        if (this.handles) {
            this.handles.addChild(entityX)
            this.handles.addChild(entityY)
            this.handles.addChild(entityZ)
        }
    }
    public createSphereEntity(axis: GIZMO_AXIS) {
        if (!this._rotateSphereMesh) throw new Error('rotateSphereMesh is not defined')

        const sphereMaterial = this.handleMaterial.clone()
        sphereMaterial.name = `sphereMaterial_${axis}`
        if (axis === GIZMO_AXIS.X) {
            sphereMaterial.changeColor(GIZMO_RED.clone())
        } else if (axis === GIZMO_AXIS.Y) {
            sphereMaterial.changeColor(GIZMO_GREEN.clone())
        } else if (axis === GIZMO_AXIS.Z) {
            sphereMaterial.changeColor(GIZMO_BLUE.clone())
        }

        const axisContainer = new Entity('render')
        axisContainer.name = `AXIS_CONTAINER_${axis}`
        axisContainer.tags.add('axis')
        axisContainer.tags.add(axis)

        const rotateSphereEntity = new Entity('render')
        rotateSphereEntity.name = `AXIS_TORUS_${axis}`
        rotateSphereEntity.addComponent('render', {
            meshInstances: [new MeshInstance(this._rotateSphereMesh, sphereMaterial)],
            layers: [],
        })

        axisContainer.addChild(rotateSphereEntity)
        rotateSphereEntity.tags.add('gizmo')
        rotateSphereEntity.tags.add('handles')

        this.assingGizmoLayer(rotateSphereEntity)

        if (axis === GIZMO_AXIS.X) {
            rotateSphereEntity.setEulerAngles(0, 0, -90)
        } else if (axis === GIZMO_AXIS.Y) {
            rotateSphereEntity.setEulerAngles(0, 90, 0)
        } else if (axis === GIZMO_AXIS.Z) {
            rotateSphereEntity.setEulerAngles(90, 0, 0)
        }

        return axisContainer
    }
    setActivePlane(axis: GIZMO_AXIS | GIZMO_PLANES | 'E', eye: Vec3) {
        if (axis === 'E') {
            const planeToActivate = this.planes.findByName('XYZE')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'X') {
            const planeToActivate = this.planes.findByName('YZ')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'Y') {
            const planeToActivate = this.planes.findByName('XZ')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }

        if (axis === 'Z') {
            const planeToActivate = this.planes.findByName('XY')
            if (planeToActivate) this.activePlane = planeToActivate as Entity
        }
    }
}
