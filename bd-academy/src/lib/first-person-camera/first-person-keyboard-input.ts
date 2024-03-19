import { Application, Entity, KEY_A, KEY_D, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_S, KEY_SPACE, KEY_UP, KEY_W } from 'playcanvas'
import { KeyboardInput } from '../input-handlers/keyboard-input'
import { FirstPersonCamera } from './first-person-camera'

export default class FirstPersonKeyboardInput extends KeyboardInput {
    private firstPersonCamera: FirstPersonCamera
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')
        const firstPersonCamera = this.entity.script.get('FirstPersonCamera')
        if (!firstPersonCamera) throw new Error('FirstPersonCamera is not defined')
        this.firstPersonCamera = firstPersonCamera as FirstPersonCamera
    }

    public onKeyDown = (event: any) => {
        if (!this.firstPersonCamera.enabled) return
        this.updateMovement(event, 1)
    }

    private updateMovement = (event: any, value: number) => {
        if (
            this.app.keyboard.isPressed(KEY_W) ||
            this.app.keyboard.isPressed(KEY_UP) ||
            this.app.keyboard.wasReleased(KEY_W) ||
            this.app.keyboard.wasReleased(KEY_UP)
        ) {
            this.firstPersonCamera.updateForward(value)
        } else if (
            this.app.keyboard.isPressed(KEY_S) ||
            this.app.keyboard.isPressed(KEY_DOWN) ||
            this.app.keyboard.wasReleased(KEY_S) ||
            this.app.keyboard.wasReleased(KEY_DOWN)
        ) {
            this.firstPersonCamera.updateForward(-value)
        } else if (
            this.app.keyboard.isPressed(KEY_A) ||
            this.app.keyboard.isPressed(KEY_LEFT) ||
            this.app.keyboard.wasReleased(KEY_A) ||
            this.app.keyboard.wasReleased(KEY_LEFT)
        ) {
            this.firstPersonCamera.updateStrafe(-value)
        } else if (
            this.app.keyboard.isPressed(KEY_D) ||
            this.app.keyboard.isPressed(KEY_RIGHT) ||
            this.app.keyboard.wasReleased(KEY_D) ||
            this.app.keyboard.wasReleased(KEY_RIGHT)
        ) {
            this.firstPersonCamera.updateStrafe(value)
        } else if (this.app.keyboard.isPressed(KEY_SPACE)) {
            this.firstPersonCamera.jump()
        }
    }

    public onKeyUp = (event: any) => {
        if (!this.firstPersonCamera.enabled) return
        this.updateMovement(event, 0)
    }
}
