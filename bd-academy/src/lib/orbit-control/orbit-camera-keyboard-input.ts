import {
    Application,
    EVENT_KEYDOWN,
    EVENT_KEYUP,
    Entity,
    KEY_A,
    KEY_D,
    KEY_DOWN,
    KEY_LEFT,
    KEY_RIGHT,
    KEY_S,
    KEY_SPACE,
    KEY_UP,
    KEY_W,
    ScriptType,
    Vec3,
} from 'playcanvas'
import { OrbitCamera } from '.'

export class OrbitCameraKeyboardInput extends ScriptType {
    // protected _enabled: boolean = true
    private orbitSensitivity = 0.3
    public orbitCamera: OrbitCamera
    private startDistance: number = 0
    private startYaw: number = 0
    private startPitch: number = 0
    private startPivotPosition: Vec3 = new Vec3()
    public name: string = 'KeyboardInput'

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')
        const orbitCamera = this.entity.script.get('OrbitCamera')
        if (!orbitCamera) throw new Error('orbitCamera is not defined')
        this.orbitCamera = orbitCamera as OrbitCamera

        this.app.keyboard.on(EVENT_KEYDOWN, this.onKeyDown, this)
        this.app.keyboard.on(EVENT_KEYUP, this.onKeyUp, this)
    }

    public initialize = () => {}
    public postInitialize = () => {
        if (this.orbitCamera) {
            this.startDistance = this.orbitCamera.distance
            this.startYaw = this.orbitCamera.yaw
            this.startPitch = this.orbitCamera.pitch
            this.startPivotPosition = this.orbitCamera.pivotPoint.clone()
        }
    }
    private kandleKeyPressedLoop = () => {
        if (this.orbitCamera) {
            if (this.app.keyboard.isPressed(KEY_SPACE)) {
                this.orbitCamera.reset(this.startYaw, this.startPitch, this.startDistance)
                this.orbitCamera.pivotPoint = this.startPivotPosition
            }
            if (this.app.keyboard.isPressed(KEY_W) || this.app.keyboard.isPressed(KEY_UP)) {
                this.orbitCamera.pitch = this.orbitCamera.pitch - this.orbitSensitivity
            }
            if (this.app.keyboard.isPressed(KEY_S) || this.app.keyboard.isPressed(KEY_DOWN)) {
                this.orbitCamera.pitch = this.orbitCamera.pitch + this.orbitSensitivity
            }
            if (this.app.keyboard.isPressed(KEY_A) || this.app.keyboard.isPressed(KEY_LEFT)) {
                this.orbitCamera.yaw = this.orbitCamera.yaw - this.orbitSensitivity
            }
            if (this.app.keyboard.isPressed(KEY_D) || this.app.keyboard.isPressed(KEY_RIGHT)) {
                this.orbitCamera.yaw = this.orbitCamera.yaw + this.orbitSensitivity
            }
        }
    }

    private onKeyDown = () => {
        this.kandleKeyPressedLoop()
    }

    private onKeyUp = () => {}
}
