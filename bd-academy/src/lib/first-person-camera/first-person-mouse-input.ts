import { Application, Entity } from 'playcanvas'
import { MouseInput } from '../input-handlers/mouse-input'
import { FirstPersonCamera } from './first-person-camera'

export default class FirstPersonMouseInput extends MouseInput {
    private canvas: HTMLCanvasElement
    private firstPersonCamera: FirstPersonCamera
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        this.canvas = this.app.graphicsDevice.canvas
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')
        const firstPersonCamera = this.entity.script.get('FirstPersonCamera')
        if (!firstPersonCamera) throw new Error('FirstPersonCamera is not defined')
        this.firstPersonCamera = firstPersonCamera as FirstPersonCamera
    }

    public onMouseDown = (event: any) => {
        if (!this.firstPersonCamera.enabled) return // think aboyt disabling globally ?
        // this.firstPersonCamera.reset()
        if (this.app.xr?.active) return
        if (event.element === this.canvas && document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock()
        }
    }
    // public onMouseUp = (event: any) => {}
    public onMouseMove = (event: any) => {
        if (!this.firstPersonCamera.enabled) return
        if (document.pointerLockElement === this.canvas) {
            const movementX = event.event.movementX || event.event.webkitMovementX || event.event.mozMovementX || 0
            const movementY = event.event.movementY || event.event.webkitMovementY || event.event.mozMovementY || 0

            this.firstPersonCamera.look(movementX / 5, movementY / 5)
        }
    }

    // public onMouseWheel = (event: any) => {}
    // public onMouseOut = (event: any) => {}
}
