import {
    AppBase,
    Application,
    BODYTYPE_DYNAMIC,
    BODYTYPE_STATIC,
    BODYTYPE_KINEMATIC,
    Color,
    Entity,
    Mat4,
    Vec3,
    Vec4,
    registerScript,
    GraphNode,
} from 'playcanvas'
import { BehaviorSubject } from 'rxjs'
import { FirstPersonCamera, FirstPersonCharacterController } from '../first-person-camera'
import FirstPersonKeyboardInput from '../first-person-camera/first-person-keyboard-input'
import FirstPersonMouseInput from '../first-person-camera/first-person-mouse-input'
import { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch } from '../orbit-control'
import { OrbitCameraKeyboardInput } from '../orbit-control/orbit-camera-keyboard-input'

export default class CameraManager {
    private app: Application | AppBase
    public editorCamera: Entity | null = null
    private _firstPersonCamera: Entity | null = null
    private _vrCamera: Entity | null = null
    public activeCamera = new BehaviorSubject<Entity | null>(null)
    private cameras = new Map<string, Entity>()
    private _orbitCamera: OrbitCamera | null = null
    private _firstPersonCameraScript: FirstPersonCamera | null = null
    private _firstPersonCharacterController: FirstPersonCharacterController | null = null
    public updates: Function[] = []
    private editorCameraStartPosition = new Vec3(0, 0, 0)
    private editorCameraStartFocus = new Vec3(0, 0, 0)

    public lastActiveCamera: string = 'editorCamera'

    constructor(app: Application | AppBase) {
        this.app = app
        this.activeCamera.next(null)
    }

    get orbitCamera() {
        return this._orbitCamera
    }
    get vrCamera() {
        return this._vrCamera
    }
    get firstPersonCamera() {
        return this._firstPersonCamera
    }
    copyPositionOfCameraToFirstPersonCamera = (camera: Entity | GraphNode) => {
        if (!this._firstPersonCamera) return
        const fs = this._firstPersonCamera.script?.get('FirstPersonCamera')
        if (fs instanceof FirstPersonCamera) {
            fs.entity.enabled = false
            fs.cameraStartPosition.copy(camera.getPosition())
            fs.cameraStartLocalPosition.copy(camera.getLocalPosition())
            // fs.cameraStartRotation.copy(camera.getEulerAngles())
            // fs.cameraStartLocalRotation.copy(camera.getLocalEulerAngles())
            const rot = camera.getRotation()
            const axisAngle = new Vec3(0, 0, 0)
            const angle = rot.getAxisAngle(axisAngle)
            axisAngle.mulScalar(angle)
            fs.cameraStartRotation = axisAngle
            fs.cameraStartLocalRotation = axisAngle

            fs.reset()
            fs.entity.enabled = true
        }
    }

    init() {
        this._createEditorCamera()
        this._createFirstPersonCamera()
    }
    public reset() {
        if (this.app.root) {
            this.orbitCamera?.focus(this.app.root)
        }
        this.orbitCamera?.entity.setPosition(this.editorCameraStartPosition)
        if (this._firstPersonCamera) {
            const fs = this._firstPersonCamera.script?.get('FirstPersonCamera')
            if (fs instanceof FirstPersonCamera) {
                fs.entity.enabled = false
                fs.cameraStartPosition.copy(Vec3.ZERO)
                fs.cameraStartLocalPosition.copy(Vec3.ZERO)
                fs.cameraStartRotation.copy(Vec3.ZERO)
                fs.cameraStartLocalRotation.copy(Vec3.ZERO)
                fs.reset()
                fs.entity.enabled = true
            }
        }
        this.app.fire('cameraManager:reset')
    }

    public showFirstpersonPreview = (state?: boolean) => {
        if (!this._firstPersonCamera) return
        if (!this.app) return
        if (!this._firstPersonCamera.camera) return
        if (this.activeCamera.value?.name === 'firstPersonCamera') {
            return
        }
        this._firstPersonCamera.enabled = !this._firstPersonCamera.enabled
        if (state === false) {
            //reset view to strem full canvas
            const rect = this.app.graphicsDevice.clientRect
            this._firstPersonCamera.camera.rect = new Vec4(0, 0, 1, 1)
            this._firstPersonCamera.enabled = false
            return
        }
        if (this._firstPersonCamera.enabled) {
            const rect = this.app.graphicsDevice.clientRect
            this._firstPersonCamera.camera.rect = new Vec4(0, 1 - 300 / rect.height, 300 / rect.width, 300 / rect.height)
        } else {
            const rect = this.app.graphicsDevice.clientRect
            this._firstPersonCamera.camera.rect = new Vec4(0, 0, 1, 1)
        }
    }

    public addCamera = (camera: Entity) => {
        this.cameras.set(camera.name, camera)
    }

    public setCamera = (cameraName: string) => {
        if (!this.app) return
        const activeCamera = this.activeCamera.value
        if (activeCamera) {
            this.lastActiveCamera = activeCamera.name
            if (activeCamera.name !== 'editorCamera') activeCamera.enabled = false
        }
        const cameraToActive = this.cameras.get(cameraName)
        if (!cameraToActive) return this.activeCamera.next(null)
        if (cameraToActive.name === 'firstPersonCamera') {
            this.showFirstpersonPreview(false)
        }
        cameraToActive.enabled = true
        this.activeCamera.next(cameraToActive as Entity)
    }

    public addOrbitCameraTools = () => {
        this._addOrbitCameraSupport()
        this._addOrbitCameraMouseInputSupport()
        this._addOrbitCameraMouseTouchSupport()
        this._addOrbitCameraKeyboardInputSupport() // Enable WASD + Arrow keys navigation
    }
    public addFirstPersonCameraTools = () => {
        this._addFirstPersonCameraSupport()
        this._addCollisionAndRigidbodyToFirstPersonCamera()
        this._addFirstPersonCharacterController()
        this._addFirstPersonMouseInputSupport()
        // this._addFirstPersonMouseTouchSupport()
        this._addFirstPersonKeyboardInputSupport()
    }

    private _createEditorCamera = () => {
        if (!this.app) return
        this.editorCamera = new Entity('editorCamera', this.app)
        this.editorCamera.addComponent('script', {})
        this.editorCamera.addComponent('camera', {
            nearClip: 0.1,
            farClip: 1000,
            fov: 50,
        })
        this.editorCamera.enabled = true
        this.addCamera(this.editorCamera)
        this.editorCamera.setPosition(new Vec3(0, 3, 3))
        this.editorCamera.lookAt(new Vec3())
        this.setCamera('editorCamera')
        return this.editorCamera
    }
    public createVrCamera = () => {
        if (!this.app) return
        this._vrCamera = new Entity('vrCamera', this.app)
        this._vrCamera.addComponent('script', {})
        this._vrCamera.addComponent('camera', {
            nearClip: 0.1,
            farClip: 1000,
            fov: 50,
        })
        this._vrCamera.enabled = false
        this.addCamera(this._vrCamera)
        this._vrCamera.setPosition(new Vec3(0, 0, 0))
        this._vrCamera.setEulerAngles(new Vec3(0, 0, 0))
        this._vrCamera.lookAt(new Vec3())
        if (this._vrCamera.camera) {
            this._vrCamera.camera.clearColorBuffer = true
            this._vrCamera.camera.clearColor = new Color(1, 1, 1)
        }

        return this._vrCamera
    }
    private _createFirstPersonCamera = () => {
        if (!this.app) return
        this._firstPersonCamera = new Entity('firstPersonCamera', this.app)
        this._firstPersonCamera.addComponent('script')
        this._firstPersonCamera.addComponent('camera', {
            nearClip: 0.1,
            farClip: 1000,
            fov: 50,
        })
        this._firstPersonCamera.enabled = false
        this.addCamera(this._firstPersonCamera)
        // this._firstPersonCamera.setPosition(new Vec3(0, 0, 0))
        // this._firstPersonCamera.setEulerAngles(new Vec3(0, 0, 0))
        // this._firstPersonCamera.lookAt(new Vec3(0, 0, 0))
        // this.firstPersonCameraStartTransform = {
        //     world: this._firstPersonCamera.getWorldTransform(),
        //     local: this._firstPersonCamera.getLocalTransform(),
        // }
        return this._firstPersonCamera
    }

    private _addOrbitCameraSupport = () => {
        if (!this.editorCamera) return console.log('No editor Camera')
        if (!this.editorCamera.script) return console.log('Editor Camera Missing script component')
        if (this.editorCamera.script.has('OrbitCamera')) return
        const script = this.app.scripts.get('OrbitCamera')
        if (!script) registerScript(OrbitCamera, 'OrbitCamera', this.app)

        const orbitCamera = this.editorCamera.script.create(OrbitCamera, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })

        if (orbitCamera instanceof OrbitCamera) {
            this._orbitCamera = orbitCamera
            this.updates.push(this._orbitCamera.update.bind(this._orbitCamera))
        }
    }

    private _addOrbitCameraMouseInputSupport = () => {
        if (!this.editorCamera) return console.log('No editor Camera')
        if (!this.editorCamera.script) return console.log('Editor Camera Missing script component')
        if (this.editorCamera.script.has('OrbitCameraInputMouse')) return
        const script = this.app.scripts.get('OrbitCameraInputMouse')
        if (!script) registerScript(OrbitCameraInputMouse, 'OrbitCameraInputMouse', this.app)

        const orbitCameraInputMouse = this.editorCamera.script.create(OrbitCameraInputMouse, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
    }
    private _addOrbitCameraMouseTouchSupport = () => {
        if (!this.editorCamera) return console.log('No editor Camera')
        if (!this.editorCamera.script) return console.log('Editor Camera Missing script component')
        if (this.editorCamera.script.has('OrbitCameraInputTouch')) return
        const script = this.app.scripts.get('OrbitCameraInputTouch')
        if (!script) registerScript(OrbitCameraInputTouch, 'OrbitCameraInputTouch', this.app)

        const orbitCameraInputTouch = this.editorCamera.script.create(OrbitCameraInputTouch, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
    }

    private _addOrbitCameraKeyboardInputSupport = () => {
        if (!this.editorCamera) return console.log('No editor Camera')
        if (!this.editorCamera.script) return console.log('Editor Camera Missing script component')
        const script = this.app.scripts.get('OrbitCameraKeyboardInput')
        if (!script) registerScript(OrbitCameraKeyboardInput, 'OrbitCameraKeyboardInput', this.app)

        const orbitCameraKeyboardInput = this.editorCamera.script.create(OrbitCameraKeyboardInput, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
    }

    private _addFirstPersonCameraSupport = () => {
        if (!this._firstPersonCamera) return console.log('No First Person Camera')
        if (!this._firstPersonCamera.script) return console.log('First Person Camera missing script component')
        const script = this.app.scripts.get('FirstPersonCamera')
        if (!script) registerScript(FirstPersonCamera, 'FirstPersonCamera', this.app)

        const firstPersonCameraScript = this._firstPersonCamera.script.create(FirstPersonCamera, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })

        if (firstPersonCameraScript instanceof FirstPersonCamera) {
            this._firstPersonCameraScript = firstPersonCameraScript
            this.updates.push(this._firstPersonCameraScript.update.bind(this._firstPersonCameraScript))
        }
    }

    private _addCollisionAndRigidbodyToFirstPersonCamera = () => {
        if (!this._firstPersonCamera) return console.log('No First Person Camera')
        if (!this._firstPersonCamera.script) return console.log('First Person Camera missing script component')

        if (this._firstPersonCamera.collision) this._firstPersonCamera.removeComponent('collision')
        if (this._firstPersonCamera.rigidbody) this._firstPersonCamera.removeComponent('rigidbody')
        // this._firstPersonCamera.addComponent('collision', {
        //     halfExtents: new Vec3(0.6, 1.84,0.4),
        //     type: 'box',
        // })
        this._firstPersonCamera.addComponent('collision', {
            type: 'capsule',
            height: 1.84,
            radius: 0.35,
        })
        this._firstPersonCamera.addComponent('rigidbody', {
            type: BODYTYPE_KINEMATIC, // must be dynamic bot fall down TODO
            mass: 80,
            linearDamping: 0.99,
            linearFactor: new Vec3(1, 1, 1),
            angularFactor: new Vec3(0, 0, 0),
            friction: 0.75,
            restitution: 0.5,
        })

        // if (this._firstPersonCamera.collision) {
        //     const b = createCollisionBB(this.app, this._firstPersonCamera)
        //     this.app.root?.addChild(b)
        //     console.log(this._firstPersonCamera)
        // }
    }

    private _addFirstPersonCharacterController = () => {
        if (!this._firstPersonCamera) return console.log('No First Person Camera')
        if (!this._firstPersonCamera.script) return console.log('First Person Camera missing script component')
        const script = this.app.scripts.get('FirstPersonCharacterController')
        if (!script) registerScript(FirstPersonCharacterController, 'FirstPersonCharacterController', this.app)

        const firstPersonCharacterController = this._firstPersonCamera.script.create(FirstPersonCharacterController, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })

        if (firstPersonCharacterController instanceof FirstPersonCharacterController) {
            this._firstPersonCharacterController = firstPersonCharacterController
            this.updates.push(this._firstPersonCharacterController.update.bind(this._firstPersonCharacterController))
        }
    }

    private _addFirstPersonMouseInputSupport = () => {
        if (!this._firstPersonCamera) return console.log('No First Person Camera')
        if (!this._firstPersonCamera.script) return console.log('First Person Camera missing script component')
        const script = this.app.scripts.get('FirstPersonMouseInput')
        if (!script) registerScript(FirstPersonMouseInput, 'FirstPersonMouseInput', this.app)
        const firstPersonMouseInput = this._firstPersonCamera.script.create(FirstPersonMouseInput, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
    }
    private _addFirstPersonKeyboardInputSupport = () => {
        if (!this._firstPersonCamera) return console.log('No First Person Camera')
        if (!this._firstPersonCamera.script) return console.log('First Person Camera missing script component')
        const script = this.app.scripts.get('FirstPersonKeyboardInput')
        if (!script) registerScript(FirstPersonKeyboardInput, 'FirstPersonKeyboardInput', this.app)
        const firstPersonKeyboardInput = this._firstPersonCamera.script.create(FirstPersonKeyboardInput, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
    }
}
