import { Application, EVENT_TOUCHCANCEL, EVENT_TOUCHEND, EVENT_TOUCHMOVE, EVENT_TOUCHSTART, Entity, ScriptType, Vec2, Vec3 } from 'playcanvas'
import { OrbitCamera } from './orbit-camera'

export class OrbitCameraInputTouch extends ScriptType {
    private orbitSensitivity = 0.3
    private distanceSensitivity = 0.15
    private orbitCamera: OrbitCamera
    private lookButtonDown: boolean = false
    private panButtonDown: boolean = false
    private lastTouchPoint: Vec2 = new Vec2()
    private lastPinchMidPoint: Vec2 = new Vec2()
    private lastPinchDistance: number = 0
    private pinchMidPoint: Vec2 = new Vec2()
    private fromWorldPoint = new Vec3()
    private toWorldPoint = new Vec3()
    private worldDiff = new Vec3()
    public entity: Entity
    constructor(args: { app: Application; entity: Entity }) {
        super(args)

        this.app = args.app
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')
        const orbitCamera = this.entity.script.get('OrbitCamera')
        if (!orbitCamera) throw new Error('orbitCamera is not defined')
        this.orbitCamera = orbitCamera as OrbitCamera
    }

    initialize = (): void => {
        // Store the position of the touch so we can calculate the distance moved
        this.lastTouchPoint = new Vec2()
        this.lastPinchMidPoint = new Vec2()
        this.lastPinchDistance = 0

        if (this.orbitCamera && this.app.touch) {
            // Use the same callback for the touchStart, touchEnd and touchCancel events as they
            // all do the same thing which is to deal the possible multiple touches to the screen
            this.app.touch.on(EVENT_TOUCHSTART, this.onTouchStartEndCancel, this)
            this.app.touch.on(EVENT_TOUCHEND, this.onTouchStartEndCancel, this)
            this.app.touch.on(EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this)

            this.app.touch.on(EVENT_TOUCHMOVE, this.onTouchMove, this)

            this.on('destroy', () => {
                this.app.touch.off(EVENT_TOUCHSTART, this.onTouchStartEndCancel, this)
                this.app.touch.off(EVENT_TOUCHEND, this.onTouchStartEndCancel, this)
                this.app.touch.off(EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this)

                this.app.touch.off(EVENT_TOUCHMOVE, this.onTouchMove, this)
            })
        }
    }

    private getPinchDistance = (pointA: Vec2, pointB: Vec2) => {
        // Return the distance between the two points
        let dx = pointA.x - pointB.x
        let dy = pointA.y - pointB.y

        return Math.sqrt(dx * dx + dy * dy)
    }
    private calcMidPoint = (pointA: Vec2, pointB: Vec2, result: Vec2) => {
        result.set(pointB.x - pointA.x, pointB.y - pointA.y)
        result.mulScalar(0.5)
        result.x += pointA.x
        result.y += pointA.y
    }
    private onTouchStartEndCancel = (event: any) => {
        // We only care about the first touch for camera rotation. As the user touches the screen,
        // we stored the current touch position
        let touches = event.touches
        if (touches.length === 1) {
            this.lastTouchPoint.set(touches[0].x, touches[0].y)
        } else if (touches.length === 2) {
            // If there are 2 touches on the screen, then set the pinch distance
            this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1])
            this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint)
        }
    }
    private pan = (midPoint: Vec2) => {
        let fromWorldPoint = this.fromWorldPoint
        let toWorldPoint = this.toWorldPoint
        let worldDiff = this.worldDiff

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        let camera = this.entity.camera
        let distance = this.orbitCamera.distance
        if (!camera) throw new Error('entity.camera is not defined')

        camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint)
        camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint)

        worldDiff.sub2(toWorldPoint, fromWorldPoint)

        this.orbitCamera.pivotPoint.add(worldDiff)
    }

    private onTouchMove = (event: any) => {
        let pinchMidPoint = this.pinchMidPoint

        // We only care about the first touch for camera rotation. Work out the difference moved since the last event
        // and use that to update the camera target position
        let touches = event.touches
        if (touches.length === 1) {
            let touch = touches[0]

            this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity
            this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity

            this.lastTouchPoint.set(touch.x, touch.y)
        } else if (touches.length === 2) {
            // Calculate the difference in pinch distance since the last event
            let currentPinchDistance = this.getPinchDistance(touches[0], touches[1])
            let diffInPinchDistance = currentPinchDistance - this.lastPinchDistance
            this.lastPinchDistance = currentPinchDistance

            this.orbitCamera.distance -= diffInPinchDistance * this.distanceSensitivity * 0.1 * (this.orbitCamera.distance * 0.1)

            // Calculate pan difference
            this.calcMidPoint(touches[0], touches[1], pinchMidPoint)
            this.pan(pinchMidPoint)
            this.lastPinchMidPoint.copy(pinchMidPoint)
        }
    }
}
