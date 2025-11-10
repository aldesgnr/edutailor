import { Application, Entity, Mat4, ScriptType, Vec2, Vec3, math } from 'playcanvas'
import { FirstPersonCharacterController } from './first-person-character-controller'

export class FirstPersonCamera extends ScriptType {
    public entity: Entity
    // public enabled = true
    public app
    private x: Vec3 = new Vec3()
    private y: Vec3 = new Vec3()
    private z: Vec3 = new Vec3()
    private heading = new Vec3()
    private magnitude = new Vec2()
    private azimuth: number = 0
    private elevation: number = 0

    private _forward = 0
    private _strafe = 0
    private _jump = false

    public cameraStartPosition = new Vec3()
    public cameraStartRotation = new Vec3()
    public cameraStartLocalPosition = new Vec3()
    public cameraStartLocalRotation = new Vec3()
    public cameraStartForward = new Vec3()

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
    }

    public initialize(): void {
        this.entity.setPosition(this.cameraStartPosition)
        this.entity.setEulerAngles(this.cameraStartRotation)
        this.entity.setLocalPosition(this.cameraStartLocalPosition)
        this.entity.setLocalEulerAngles(this.cameraStartLocalRotation)
        this.calcAzimuthElevation()
    }

    private calcAzimuthElevation() {
        this.x = new Vec3()
        this.z = new Vec3()
        this.heading = new Vec3()
        this.magnitude = new Vec2()

        this.azimuth = 0
        this.elevation = 0

        // Calculate camera azimuth/elevation
        const temp = this.entity.forward.clone()
        temp.y = 0
        temp.normalize()
        this.azimuth = Math.atan2(-temp.x, -temp.z) * (180 / Math.PI)

        const rot = new Mat4().setFromAxisAngle(Vec3.UP, -this.azimuth)
        rot.transformVector(this.entity.forward, temp)
        this.elevation = Math.atan(temp.y / temp.z) * (180 / Math.PI) // ???

        this._forward = 0
        this._strafe = 0
        this._jump = false

        const { x, y } = this.cameraStartRotation
        this.azimuth = y
        this.elevation = x
    }
    public reset() {
        // const { x, y } = this.cameraStartRotation
        // this.azimuth = y
        // this.elevation = x
        // this.calcAzimuthElevation()
        this.entity.setPosition(this.cameraStartPosition)
        this.entity.setEulerAngles(this.cameraStartRotation)
        this.entity.setLocalPosition(this.cameraStartLocalPosition)
        this.entity.setLocalEulerAngles(this.cameraStartLocalRotation)
        //tODO: fix this
        this.calcAzimuthElevation()
        // const { x, y } = this.cameraStartRotation
        // this.azimuth = y
        // this.elevation = x
    }

    public update = (dt: number) => {
        if (!this.entity.enabled) return
        this.postUpdate(dt)
    }

    public look = (azimuthDelta: number, elevationDelta: number) => {
        this.azimuth += azimuthDelta
        this.elevation += elevationDelta
        this.elevation = math.clamp(this.elevation, -90, 90)
    }
    public jump() {
        this._jump = true
    }
    public updateForward(forward: number) {
        this._forward = forward
    }
    public updateStrafe(strafe: number) {
        this._strafe = strafe
    }
    public postUpdate(dt: number): void {
        // Update the camera's orientation
        this.entity.setEulerAngles(this.elevation, this.azimuth, 0)

        // Calculate the camera's heading in the XZ plane
        this.z.copy(this.entity.forward)
        this.z.y = 0
        this.z.normalize()

        this.x.copy(this.entity.right)
        this.x.y = 0
        this.x.normalize()

        this.heading.set(0, 0, 0)

        // Move forwards/backwards
        if (this._forward !== 0) {
            this.z.mulScalar(this._forward)
            this.heading.add(this.z)
        }

        // Strafe left/right
        if (this._strafe !== 0) {
            this.x.mulScalar(this._strafe)
            this.heading.add(this.x)
        }

        if (this.heading.length() > 0.0001) {
            this.magnitude.set(this._forward, this._strafe)
            this.heading.normalize().mulScalar(this.magnitude.length())
        }
        const firstPersonCharacterController = this.entity.script?.get('FirstPersonCharacterController')

        if (this._jump) {
            if (firstPersonCharacterController instanceof FirstPersonCharacterController) firstPersonCharacterController.jump()
            this._jump = false
        }

        if (firstPersonCharacterController instanceof FirstPersonCharacterController) firstPersonCharacterController.move(this.heading)
        const pos = this.entity.getPosition()
        this.app.fire('firstPersonCamera:updated', pos)
    }
}
