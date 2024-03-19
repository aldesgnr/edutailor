// create typescript class for orbitCamera in playcanvas engine
import { Application, BoundingBox, Entity, ModelComponent, Quat, RenderComponent, ScriptType, Vec3, math } from 'playcanvas'
import { BehaviorSubject } from 'rxjs'

export class OrbitCamera extends ScriptType {
    //  class OrbitCamera implements ScriptType {
    public positionChanged: BehaviorSubject<Vec3> = new BehaviorSubject(new Vec3())
    private _targetDistance: number = 1
    private _targetPitch: number = 0
    private distanceMax: number = 100
    private distanceMin: number = -100
    private pitchAngleMax: number = 90
    private pitchAngleMin: number = -90
    private inertiaFactor: number = 0
    private focusEntity: Entity = new Entity()
    private frameOnStart: boolean = true
    private _yaw: number = 0
    private _targetYaw: number = 0
    private _pivotPoint: Vec3 = new Vec3()
    private _pitch: any
    private _modelsAabb: BoundingBox = new BoundingBox()
    private distanceBetween: Vec3 = new Vec3()
    private quatWithoutYaw: Quat = new Quat()
    private yawOffset: Quat = new Quat()
    private _distance: number = 0.01
    public entity: Entity
    public app

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
    }

    // Property to get and set the distance between the pivot point and camera
    // Clamped between this.distanceMin and this.distanceMax
    get distance() {
        return this._targetDistance
    }

    set distance(value) {
        this._targetDistance = this._clampDistance(value)
    }

    // Property to get and set the pitch of the camera around the pivot point (degrees)
    // Clamped between this.pitchAngleMin and this.pitchAngleMax
    // When set at 0, the camera angle is flat, looking along the horizon
    get pitch() {
        return this._targetPitch
    }

    set pitch(value) {
        this._targetPitch = this._clampPitchAngle(value)
    }

    // Property to get and set the yaw of the camera around the pivot point (degrees)
    get yaw() {
        return this._targetYaw
    }
    set yaw(value) {
        this._targetYaw = value
        // Ensure that the yaw takes the shortest route by making sure that
        // the difference between the targetYaw and the actual is 180 degrees
        // in either direction
        const diff = this._targetYaw - this._yaw
        const reminder = diff % 360
        if (reminder > 180) {
            this._targetYaw = this._yaw - (360 - reminder)
        } else if (reminder < -180) {
            this._targetYaw = this._yaw + (360 + reminder)
        } else {
            this._targetYaw = this._yaw + reminder
        }
    }

    // Property to get and set the world position of the pivot point that the camera orbits around
    get pivotPoint() {
        return this._pivotPoint
    }
    set pivotPoint(value) {
        this._pivotPoint.copy(value)
    }

    private _clampDistance = (distance: number) => {
        if (this.distanceMax > 0) {
            return math.clamp(distance, this.distanceMin, this.distanceMax)
        }
        return Math.max(distance, this.distanceMin)
    }
    private _clampPitchAngle = (pitchAngle: number) => {
        return math.clamp(pitchAngle, this.pitchAngleMin, this.pitchAngleMax)
    }
    private _getMouseOnScreen = (clientX: number, clientY: number) => {}
    // Moves the camera to look at an entity and all its children so they are all in the view
    public focus = (focusEntity: Entity) => {
        this._buildAabb(focusEntity)
        const halfExtents = this._modelsAabb.halfExtents
        const radius = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z))
        if (!this.entity.camera) throw new Error('entity.camera is not defined')
        this.distance = (radius * 1.5) / Math.sin(0.5 * this.entity.camera.fov * math.DEG_TO_RAD)
        this._removeInertia()

        this._pivotPoint.copy(this._modelsAabb.center)
    }

    private _buildAabb = (entity: Entity) => {
        let i,
            m,
            meshInstances = []

        const renders = entity.findComponents('render') as RenderComponent[]
        for (i = 0; i < renders.length; i++) {
            const render = renders[i]
            for (m = 0; m < render.meshInstances.length; m++) {
                meshInstances.push(render.meshInstances[m])
            }
        }

        const models = entity.findComponents('model') as ModelComponent[]
        for (i = 0; i < models.length; i++) {
            const model = models[i]
            if (!model.model) return
            for (m = 0; m < model.meshInstances.length; m++) {
                meshInstances.push(model.meshInstances[m])
            }
        }

        for (i = 0; i < meshInstances.length; i++) {
            if (i === 0) {
                this._modelsAabb.copy(meshInstances[i].aabb)
            } else {
                this._modelsAabb.add(meshInstances[i].aabb)
            }
        }
    }
    private _removeInertia = () => {
        this._yaw = this._targetYaw = 0
        this._targetDistance = this.distance
        this._targetPitch = this.pitch
    }
    private _checkAspectRatio = () => {
        // const height = this.app.graphicsDevice.height
        // const width = this.app.graphicsDevice.width
        const height = this.app.graphicsDevice.canvas.offsetHeight
        const width = this.app.graphicsDevice.canvas.offsetWidth

        if (!this.entity.camera) throw new Error('entity.camera is not defined')
        this.entity.camera.horizontalFov = height > width
    }

    private _calcYaw = (quat: Quat) => {
        const transformedForward = new Vec3()
        quat.transformVector(Vec3.FORWARD, transformedForward)
        return Math.atan2(-transformedForward.x, -transformedForward.z) * math.RAD_TO_DEG
    }
    public update = (dt: number) => {
        const oldAngles = {
            pitch: this._pitch,
            yaw: this._yaw,
        }
        const t = this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1)
        this._distance = math.lerp(this._distance, this._targetDistance, t)
        this._yaw = math.lerp(this._yaw, this._targetYaw, t)
        this._pitch = math.lerp(this._pitch, this._targetPitch, t)
        this._updatePosition()

        if (oldAngles.yaw !== this._yaw || oldAngles.pitch !== this._pitch) {
            this.positionChanged.next(this.entity.getPosition().clone())
            this.app.fire('editorCamera:position:updated', this.entity.getPosition().clone())
        }
    }
    private _updatePosition = () => {
        // Work out the camera position based on the pivot point, pitch, yaw and distance
        this.entity.setLocalPosition(0, 0, 0)
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0)
        const position = this.entity.getPosition()
        position.copy(this.entity.forward)
        position.mulScalar(-this._distance)
        position.add(this.pivotPoint)
        this.entity.setPosition(position)
    }

    private _calcPitch = (quat: Quat, yaw: number) => {
        const quatWithoutYaw = this.quatWithoutYaw
        const yawOffset = this.yawOffset

        yawOffset.setFromEulerAngles(0, -yaw, 0)
        quatWithoutYaw.mul2(yawOffset, quat)

        const transformedForward = new Vec3()

        quatWithoutYaw.transformVector(Vec3.FORWARD, transformedForward)

        return Math.atan2(transformedForward.y, -transformedForward.z) * math.RAD_TO_DEG
    }
    public reset = (yaw: number, pitch: number, distance: number) => {
        this.pitch = pitch
        this.yaw = yaw
        this.distance = distance

        this._removeInertia()
    }
    public resetAndLookAtEntity = (resetPoint: Vec3, entity: Entity) => {
        this._buildAabb(entity)
        this.resetAndLookAtPoint(resetPoint, this._modelsAabb.center)
    }

    public resetAndLookAtPoint = (resetPoint: Vec3, lookAtPoint: Vec3) => {
        this.pivotPoint.copy(lookAtPoint)
        this.entity.setPosition(resetPoint)

        this.entity.lookAt(lookAtPoint)

        const distance = this.distanceBetween
        distance.sub2(lookAtPoint, resetPoint)
        this.distance = distance.length()

        this.pivotPoint.copy(lookAtPoint)

        const cameraQuat = this.entity.getRotation()
        this.yaw = this._calcYaw(cameraQuat)
        this.pitch = this._calcPitch(cameraQuat, this.yaw)

        this._removeInertia()
        this._updatePosition()
    }
    private onWindowResize = () => {
        this._checkAspectRatio()
    }

    public initialize = () => {
        this.app.graphicsDevice.on('resizecanvas', this.onWindowResize, this)

        this._checkAspectRatio()
        // Find all the models in the scene that are under the focused entity
        this._modelsAabb = new BoundingBox()
        this._buildAabb(this.focusEntity || this.app.root)

        this.entity.lookAt(this._modelsAabb.center)

        this._pivotPoint = new Vec3()
        this._pivotPoint.copy(this._modelsAabb.center)

        // Calculate the camera euler angle rotation around x and y axes
        // This allows us to place the camera at a particular rotation to begin with in the scene
        const cameraQuat = this.entity.getRotation()

        // Preset the camera
        this._yaw = this._calcYaw(cameraQuat)
        this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw))
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0)

        this._distance = 0

        this._targetYaw = this._yaw
        this._targetPitch = this._pitch

        // If we have ticked focus on start, then attempt to position the camera where it frames
        // the focused entity and move the pivot point to entity's position otherwise, set the distance
        // to be between the camera position in the scene and the pivot point
        if (this.frameOnStart) {
            this.focus(this.focusEntity || this.app.root)
        } else {
            const distanceBetween = new Vec3()
            distanceBetween.sub2(this.entity.getPosition(), this._pivotPoint)
            this._distance = this._clampDistance(distanceBetween.length())
        }

        this._targetDistance = this._distance
        this.on('attr:distance', () => {
            this._distance = this._clampDistance(this._distance)
        })
        this.on('attr:_distance', () => {
            this._distance = this._clampDistance(this._distance)
        })
        // Reapply the clamps if they are changed in the editor
        this.on('attr:distanceMin', () => {
            this._distance = this._clampDistance(this._distance)
        })

        this.on('attr:distanceMax', () => {
            this._distance = this._clampDistance(this._distance)
        })

        this.on('attr:pitchAngleMin', () => {
            this._pitch = this._clampPitchAngle(this._pitch)
        })

        this.on('attr:pitchAngleMax', () => {
            this._pitch = this._clampPitchAngle(this._pitch)
        })

        // Focus on the entity if we change the focus entity
        this.on('attr:focusEntity', (value: Entity) => {
            if (this.frameOnStart) {
                this.focus(value || this.app.root)
            } else {
                this.resetAndLookAtEntity(this.entity.getPosition(), value || this.app.root)
            }
        })

        this.on('attr:frameOnStart', (value, prev) => {
            if (value) {
                this.focus(this.focusEntity || this.app.root)
            }
        })

        this.on('destroy', () => {
            this.app.graphicsDevice.off('resizecanvas', this.onWindowResize, this)
        })
    }
}
