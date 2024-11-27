import {
    Application,
    EVENT_MOUSEDOWN,
    EVENT_MOUSEMOVE,
    EVENT_MOUSEUP,
    EVENT_MOUSEWHEEL,
    Entity,
    MOUSEBUTTON_LEFT,
    MOUSEBUTTON_MIDDLE,
    MOUSEBUTTON_RIGHT,
    ScriptType,
    Vec2,
    Vec3,
} from 'playcanvas'
import { OrbitCamera } from './orbit-camera'
export class OrbitCameraInputMouse extends ScriptType {
    private orbitSensitivity = 0.3
    private distanceSensitivity = 0.15
    private orbitCamera: OrbitCamera
    private lookButtonDown: boolean = false
    private panButtonDown: boolean = false
    private lastPoint: Vec2 = new Vec2()

    private fromWorldPoint = new Vec3()
    private toWorldPoint = new Vec3()
    private worldDiff = new Vec3()

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

        this.app.on('camera:orbit:disable', () => {
            this.enabled = false
        })
        this.app.on('camera:orbit:enable', () => {
            this.enabled = true
        })
    }

    public initialize = () => {
        if (this.orbitCamera) {
            this.addEvents()

            this.on('destroy', () => {
                this.removeEvents()
            })
        }

        // Disabling the context menu stops the browser displaying a menu when
        // you right-click the page
        this.app.mouse.disableContextMenu()

        this.lookButtonDown = false
        this.panButtonDown = false
        this.lastPoint = new Vec2()
    }

    public addEvents = () => {
        this.app.mouse.on(EVENT_MOUSEDOWN, this.onMouseDown, this)
        this.app.mouse.on(EVENT_MOUSEUP, this.onMouseUp, this)
        this.app.mouse.on(EVENT_MOUSEMOVE, this.onMouseMove, this)
        this.app.mouse.on(EVENT_MOUSEWHEEL, this.onMouseWheel, this)

        // Listen to when the mouse travels out of the window
        // window.addEventListener('mouseout', onMouseOut, false)
        window.addEventListener('mouseout', this.onMouseOut, false)
    }

    // Remove the listeners so if this entity is destroyed
    public removeEvents = () => {
        this.app.mouse.off(EVENT_MOUSEDOWN, this.onMouseDown, this)
        this.app.mouse.off(EVENT_MOUSEUP, this.onMouseUp, this)
        this.app.mouse.off(EVENT_MOUSEMOVE, this.onMouseMove, this)
        this.app.mouse.off(EVENT_MOUSEWHEEL, this.onMouseWheel, this)

        // window.removeEventListener('mouseout', onMouseOut, false)
        window.addEventListener('mouseout', this.onMouseOut, false)
    }

    private pan = (screenPoint: Vec3) => {
        const fromWorldPoint = this.fromWorldPoint
        const toWorldPoint = this.toWorldPoint
        const worldDiff = this.worldDiff

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        const camera = this.entity.camera
        const distance = this.orbitCamera.distance
        if (!camera) throw new Error('entity.camera is not defined')
        camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint)
        camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint)

        worldDiff.sub2(toWorldPoint, fromWorldPoint)

        this.orbitCamera.pivotPoint.add(worldDiff)
    }

    public onMouseDown = (event: any) => {
        if (this.enabled === false) return
        switch (event.button) {
            case MOUSEBUTTON_LEFT:
                this.lookButtonDown = true
                break
            case MOUSEBUTTON_MIDDLE:
            case MOUSEBUTTON_RIGHT:
                this.panButtonDown = true
                break
        }
    }
    public onMouseUp = (event: any) => {
        switch (event.button) {
            case MOUSEBUTTON_LEFT:
                this.lookButtonDown = false
                break
            case MOUSEBUTTON_MIDDLE:
            case MOUSEBUTTON_RIGHT:
                this.panButtonDown = false
                break
        }
    }

    public onMouseMove = (event: any) => {
        if (this.enabled === false) return
        if (this.lookButtonDown) {
            this.orbitCamera.pitch -= event.dy * this.orbitSensitivity
            this.orbitCamera.yaw -= event.dx * this.orbitSensitivity
        } else if (this.panButtonDown) {
            this.pan(event)
        }

        this.lastPoint.set(event.x, event.y)
    }
    public onMouseWheel = (event: any) => {
        //problem with wheel repaired with this operation
        // if (isNaN(event.wheel)) {
        //     throw Error('Cant handle mouse wheel')
        // }
        let wheel = event.wheelDelta * -2

        this.orbitCamera.distance -= wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1)
        event.event.preventDefault()
    }

    public onMouseOut = (event: any) => {
        this.lookButtonDown = false
        this.panButtonDown = false
    }
}
