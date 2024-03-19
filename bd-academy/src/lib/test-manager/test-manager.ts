import {
    AppBase,
    AppOptions,
    Application,
    Entity,
    FILLMODE_FILL_WINDOW,
    GAMMA_SRGB,
    Keyboard,
    Mouse,
    RESOLUTION_AUTO,
    TONEMAP_ACES,
    TouchDevice,
    XRTYPE_VR,
} from 'playcanvas'
import { http } from '../../interceptors/axios'
import { BehaviorSubject } from 'rxjs'
import { appConfig } from '../../app.config'
import AmmoManager from '../ammo-manager/ammo-manager'
import AnimationManager from '../animation-manager/animation-manager'
import AssetsManager from '../assets-manager/assets-manager'
import AvatarManager from '../avatar-manager/avatar-manager'
import CameraManager from '../camera-manager/camera-manager'
import Diagnostic from '../diagnostic/diagnostic'
import { TrainingScene } from '../editor-manager/editor.types'
import LoaderHandleManager from '../loader-handle-manager/loader-handle-manager'
import SceneManager from '../scene-manager/scene-manager'
import { ScriptManager } from '../script-manager/script-manager'
import WebXrManager from '../webxr-manager/webxr-manager'

export default class TestManager {
    /** Managers */
    protected assetsManager: AssetsManager
    protected animationManager: AnimationManager
    protected ammoManager: AmmoManager
    protected cameraManager: CameraManager
    protected sceneManager: SceneManager
    protected avatarManager: AvatarManager
    protected scriptManager: ScriptManager
    protected webXrManager: WebXrManager
    protected loaderHandleManager: LoaderHandleManager
    /** Public */
    public app: AppBase | Application
    public loadingPercent = new BehaviorSubject<number>(0)
    public mainSceneChanged = new BehaviorSubject<Entity | null>(null)
    public trainingSceneLoaded = new BehaviorSubject<TrainingScene | null>(null)
    public applicationStarted = new BehaviorSubject<boolean>(false)
    public applicationStart = new BehaviorSubject<boolean>(false)
    public initializedManagers = new BehaviorSubject<boolean>(false)
    public initialized = new BehaviorSubject<boolean>(false)
    public initializedError = new BehaviorSubject<null | Error>(null)
    public physicsInitialized = new BehaviorSubject<boolean>(false)
    public trainingSceneStarted = new BehaviorSubject<boolean>(false)
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected updates: Array<Function> = []
    protected _abortController: AbortController | undefined
    protected _trainingScene: TrainingScene | undefined
    protected diagnostic = new Diagnostic()
    protected _debug = false
    public readonly canvas = document.createElement('canvas') as HTMLCanvasElement //new Canvas()
    public appOptions = new AppOptions()
    protected trainingSceneUUID: string | null = null
    protected _enableRender: boolean = true
    public readonly createdAt = window.performance.now()

    constructor() {
        this.canvas.id = `test-manager`
        this.app = new Application(this.canvas, {
            mouse: new Mouse(this.canvas),
            touch: new TouchDevice(this.canvas),
            keyboard: new Keyboard(window),
            graphicsDeviceOptions: {
                xrCompatible: true,
                antialias: true,
            },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(this.app as any).name = this.canvas.id
        this.loaderHandleManager = new LoaderHandleManager(this.app)
        this.assetsManager = new AssetsManager(this.app)
        this.animationManager = new AnimationManager(this.app)
        this.sceneManager = new SceneManager(this.app)
        this.avatarManager = new AvatarManager(this.app, this.animationManager)
        this.cameraManager = new CameraManager(this.app)
        this.scriptManager = new ScriptManager(this.app, this.cameraManager)
        this.webXrManager = new WebXrManager(this.app, this.cameraManager)
        this.ammoManager = new AmmoManager()
        this.initializedManagers.next(true)
        this.init()
    }

    get mainScene() {
        return this.sceneManager.mainScene
    }

    get training() {
        return this._trainingScene
    }
    get vrSupported() {
        return this.webXrManager.vrSupported.asObservable()
    }
    get vrActive() {
        return this.webXrManager.vrActive.asObservable()
    }
    get vrAvailable() {
        return this.webXrManager.vrAvailable.asObservable()
    }

    public loadAsyncModules() {
        const modulesToLoad: Promise<any>[] = []
        return new Promise<void>((resolve, reject) => {
            modulesToLoad.push(this.ammoManager.loadAmmo())
            Promise.all(modulesToLoad)
                .then(() => {})
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    public init() {
        this.loadAsyncModules()
            .then(() => {
                this.loaderHandleManager.init()
                this.sceneManager.init()
                this.cameraManager.init()

                this.webXrManager.init()

                this.app.root.addChild(this.sceneManager.mainScene)
                if (this.cameraManager.editorCamera) {
                    this.sceneManager.mainScene.addChild(this.cameraManager.editorCamera)
                }
                if (this.cameraManager.firstPersonCamera) {
                    this.sceneManager.mainScene.addChild(this.cameraManager.firstPersonCamera)
                }
                if (this.cameraManager.vrCamera) {
                    this.sceneManager.mainScene.addChild(this.cameraManager.vrCamera)
                }
                this.managerPostInitialize()
            })
            .catch((err) => {
                console.error(err)
                this.initializedError.next(err)
            })
    }

    protected managerPostInitialize() {
        this.initialized.next(true)
        this.managerStart()
    }

    protected managerStart() {
        this.app.assets.prefix = appConfig().STATIC_URL
        this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
        this.app.setCanvasResolution(RESOLUTION_AUTO)
        this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio
        this.app.scene.gammaCorrection = GAMMA_SRGB
        this.app.scene.toneMapping = TONEMAP_ACES
        this.app.start()
        this.applicationStarted.next(true)
    }

    public startVRTraing() {
        if (this.webXrManager.xrManager && this.webXrManager.xrManager.active) return
        if (this.webXrManager.isAvailable()) {
            this.webXrManager
                .start()
                .then(() => {
                    console.log('VR started')
                })
                .catch((err) => {
                    console.log('VR error', err)
                })
        } else {
            console.log('Immersive VR is not available')
        }
    }
    public endVRTraing() {
        this.webXrManager.end()
    }
    public async loadTrainingScene(trainingSceneUUID: string) {
        this.loadingPercent.next(0.01)

        this.trainingSceneUUID = trainingSceneUUID
        this.assetsManager.trainingSceneUUID = this.trainingSceneUUID
        this._abortController = new AbortController()

        const trainingReq = await http
            .get<TrainingScene>(`/static/training-scene/${this.trainingSceneUUID}/${this.trainingSceneUUID}.json?timestamp=${new Date()}`, {
                signal: this._abortController.signal,
            })
            .catch(() => {
                return {
                    data: null,
                }
            })
        if (trainingReq?.data && trainingReq?.data.training.scene) {
            this._trainingScene = trainingReq.data
            this.trainingSceneLoaded.next(this._trainingScene)
            await this.loadSceneGLB()
            // const c = createTestBox(this.app, new Vec3(4, 0.1, 4))
            // c.setPosition(0, -2, 0)
            // this.sceneManager.mainScene.addChild(c)
        } else {
            this.trainingSceneLoaded.next(null)
        }
        this.loadingPercent.next(1)
        return trainingReq
    }

    public async loadSceneGLB() {
        if (!this.trainingSceneUUID) return false
        try {
            const scene = await this.sceneManager.loadSceneGLB(this.trainingSceneUUID)
            if (scene.sceneEntity) {
                this.sceneManager.editableScene.addChild(scene.sceneEntity)
            }

            return true
        } catch (err) {
            // console.error(err)
            return false
        }
    }

    public restartTraining() {
        if (this.webXrManager.xrManager && this.webXrManager.xrManager.active) {
            this.endVRTraing()
        }

        this.cameraManager.setCamera('editorCamera')
        this.trainingSceneStarted.next(false)
    }
}
