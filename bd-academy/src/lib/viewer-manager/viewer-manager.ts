import {
    AppBase,
    AppOptions,
    Application,
    BODYTYPE_STATIC,
    BoundingBox,
    Color,
    ElementInput,
    Entity,
    FILLMODE_FILL_WINDOW,
    GAMMA_SRGB,
    Keyboard,
    Mouse,
    RESOLUTION_AUTO,
    RenderComponent,
    SCALEMODE_NONE,
    TONEMAP_ACES,
    TouchDevice,
    Vec2,
} from 'playcanvas'

import { BehaviorSubject } from 'rxjs'
import { appConfig } from '../../app.config'
import { http } from '../../interceptors/axios'
import AmmoManager from '../ammo-manager/ammo-manager'
import AnimationManager from '../animation-manager/animation-manager'
import AssetsManager from '../assets-manager/assets-manager'
import AvatarManager from '../avatar-manager/avatar-manager'
import CameraManager from '../camera-manager/camera-manager'
import Diagnostic from '../diagnostic/diagnostic'
import { Configuration, JSONEntity, TrainingScene } from '../editor-manager/editor.types'
import LoaderHandleManager from '../loader-handle-manager/loader-handle-manager'
import ScenarioEngine from '../scenarion-engine/scenarion-engine'
import SceneManager from '../scene-manager/scene-manager'
import SceneMiddelware from '../scene-middelware/scene-middelware'
import { ScriptManager } from '../script-manager/script-manager'
// import { createCameraBox, createCollisionBB, createTestBox } from '../utils/playcanvas-utils'
import { TrainingSectionComponent } from '../../components/script/script-section-component-card'
import { createCameraBox, destroyEntity, traverse } from '../utils/playcanvas-utils'
import WebXrManager from '../webxr-manager/webxr-manager'

export enum ManagerType {
    VIEWER = 'VIEWER',
    EDITOR = 'EDITOR',
}
export default class ViewerManager {
    /** Managers */
    protected assetsManager: AssetsManager
    protected animationManager: AnimationManager
    protected ammoManager: AmmoManager
    protected cameraManager: CameraManager
    protected sceneManager: SceneManager
    protected avatarManager: AvatarManager
    protected scriptManager: ScriptManager
    public scenarioEngine: ScenarioEngine
    protected webXrManager: WebXrManager
    protected loaderHandleManager: LoaderHandleManager
    /** Public */
    public app: AppBase | Application
    public loadingPercent = new BehaviorSubject<number>(0)
    public mainSceneChanged = new BehaviorSubject<Entity | null>(null)
    public trainingSceneLoaded = new BehaviorSubject<TrainingScene | null>(null)
    public applicationStarted = new BehaviorSubject<boolean>(false)
    public initialized = new BehaviorSubject<boolean>(false)
    public initializedError = new BehaviorSubject<null | Error>(null)
    public physicsInitialized = new BehaviorSubject<boolean>(false)
    public trainingSceneStarted = new BehaviorSubject<boolean>(false)
    public sceneSelected = new BehaviorSubject<boolean>(false)
    public canvas = document.createElement('canvas') as HTMLCanvasElement //new Canvas()
    public readonly debugTools: HTMLElement = document.createElement('div') as HTMLDivElement
    public appOptions = new AppOptions()
    public trainingSceneUUID: string | null = null
    public dialogUUID: string | null = null
    public walls: Entity[] = []
    public readonly createdAt = window.performance.now()
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected updates: Array<Function> = []
    protected _abortController: AbortController | undefined
    protected _trainingScene: TrainingScene | undefined
    protected diagnostic = new Diagnostic()
    protected _debug = false
    protected screenEntity: Entity | null = null
    protected _enableRender: boolean = true
    protected managerType = ManagerType.VIEWER

    constructor(type: ManagerType = ManagerType.VIEWER) {
        this.managerType = type
        this.canvas.id = `${this.managerType}-canvas`

        this.app = new Application(this.canvas, {
            mouse: new Mouse(this.canvas),
            touch: new TouchDevice(this.canvas),
            elementInput: new ElementInput(this.canvas, {
                useMouse: true,
                useTouch: true,
            }),
            keyboard: new Keyboard(window),
            graphicsDeviceOptions: {
                xrCompatible: true,
                antialias: true,
            },
        })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ; (this.app as any).name = this.canvas.id
        if (this.diagnostic.domElement) document.body.prepend(this.diagnostic.domElement)
        this.scenarioEngine = new ScenarioEngine(this.app, new SceneMiddelware())
        if (this.scenarioEngine.editorContainer && !document.querySelector('#dialogDebugWrapper')) {
            this.createDraggableDebugDialogWindow()
        }
        this.debug = appConfig().VIEWER_DEBUG

        this.loaderHandleManager = new LoaderHandleManager(this.app)
        this.assetsManager = new AssetsManager(this.app)
        this.animationManager = new AnimationManager(this.app)
        this.sceneManager = new SceneManager(this.app)
        this.avatarManager = new AvatarManager(this.app, this.animationManager)
        this.cameraManager = new CameraManager(this.app)
        this.scriptManager = new ScriptManager(this.app, this.cameraManager)
        this.webXrManager = new WebXrManager(this.app, this.cameraManager)
        this.ammoManager = new AmmoManager()
        this.init()

        /**
        this class extends ViewerManager which has async load ammo function, to proper working editor it shoyld
        run after initialize
        */
        // this.initialized.subscribe((initialized) => {
        //     if (initialized) {
        //         // this.managerPostInitialize()
        //     }
        // })
        this.applicationStarted.subscribe((started) => {
            if (started) {
                this.dispatchSceneChanged()
            }
        })
    }

    set enableRender(enableRender: boolean) {
        this._enableRender = enableRender
        this.app.autoRender = this._enableRender
        this.app.renderNextFrame = this._enableRender
    }

    get enableRender() {
        return this._enableRender
    }
    get mainScene() {
        return this.sceneManager.mainScene
    }
    set debug(debug: boolean) {
        this._debug = debug
        this.debugTools.style.display = debug ? 'block' : 'none'
        this.scenarioEngine.debug = debug
        this.diagnostic.enabled = debug
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

    public createDraggableDebugDialogWindow() {
        const dialogDebugWrapper = document.createElement('div')
        dialogDebugWrapper.id = 'dialogDebugWrapper'
        // dialogDebugWrapper.draggable = true
        dialogDebugWrapper.style.position = 'absolute'
        dialogDebugWrapper.style.bottom = '0'
        dialogDebugWrapper.style.right = '0'
        dialogDebugWrapper.style.zIndex = '1290'
        dialogDebugWrapper.style.width = '100%'
        dialogDebugWrapper.style.height = '450px'
        dialogDebugWrapper.draggable = true
        dialogDebugWrapper.style.background = 'lightgray'
        dialogDebugWrapper.style.padding = '10px'
        dialogDebugWrapper.style.cursor = 'pointer'

        dialogDebugWrapper.appendChild(this.scenarioEngine.editorContainer)
        this.debugTools.appendChild(dialogDebugWrapper)
    }

    public async loadTrainingScene(trainingSceneUUID: string) {
        this.reset()
        this.loadingPercent.next(0.01)

        this.trainingSceneUUID = trainingSceneUUID
        this.assetsManager.trainingSceneUUID = this.trainingSceneUUID
        this._abortController = new AbortController()

        const trainingSectionComponentReq = await http.get<TrainingSectionComponent>(`/api/TrainingSectionComponent/${this.trainingSceneUUID}`).catch(() => {
            return {
                data: null,
            }
        })

        if (trainingSectionComponentReq?.data) {
            this.dialogUUID = trainingSectionComponentReq?.data?.dialogId

            if (this.dialogUUID) {
                this.scenarioEngine.loadDialog(this.dialogUUID).then(() => {
                    console.log(this.dialogUUID, 'dialog loaded')
                })
            } else console.log('no dialog uuid')
        }

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
            const sceneLoaded = await this.loadSceneGLB()
            this.sceneSelected.next(sceneLoaded)
            if (!sceneLoaded) {
                this.trainingSceneLoaded.next(null)
                throw new Error('Scene not loaded')
            } else {
                if (this._trainingScene.training.avatars) {
                    const avatarP: Promise<void>[] = []
                    Object.keys(this._trainingScene.training.avatars).forEach((key) => {
                        for (const avatarObj of this.avatarManager.avatars.values()) {
                            if (!this._trainingScene) return
                            avatarObj.reset()
                            if (avatarObj.entity.name === key) {
                                const avatarInfo = this._trainingScene.training.avatars[key].avatarInfo
                                if (avatarInfo) {
                                    const p = avatarObj.replaceAvatar(avatarInfo)
                                    avatarP.push(p)
                                }
                            }
                        }
                    })
                    await Promise.all(avatarP)
                }
            }

            // const c = createTestBox(this.app, new Vec3(4, 0.1, 4))
            // c.setPosition(0, -2, 0)
            // this.sceneManager.mainScene.addChild(c)
        } else {
            this.trainingSceneLoaded.next(null)
        }
        this.focusEntity(this.sceneManager.editableScene)
        this.loadingPercent.next(1)
        this.dispatchSceneChanged()
        return trainingReq
    }

    private focusEntity(entity: Entity) {
        this.cameraManager.orbitCamera?.focus(entity)
    }
    public async loadSceneGLB() {
        if (!this.trainingSceneUUID) return false
        try {
            const scene = await this.sceneManager.loadSceneGLB(this.trainingSceneUUID)

            if (scene.sceneEntity) {
                if (this._trainingScene?.training.scene.entities) {
                    Object.values(this._trainingScene?.training.scene.entities).forEach((entityDef: JSONEntity) => {
                        if (!scene.sceneEntity) return
                        if (entityDef.tags.length === 0) return

                        const entity = scene.sceneEntity.findByName(entityDef.name)
                        if (!(entity instanceof Entity)) return
                        entity?.tags.add(entityDef.tags)
                    })
                }
                const propablyFirstPersonCameras = scene.sceneEntity.find(
                    (c) => c.name === 'FirstPerson' || c.name === 'firstPersonCamera' || c.name === 'FirstPersonCamera',
                )
                let fp = null
                if (propablyFirstPersonCameras.length > 0) {
                    fp = propablyFirstPersonCameras[0]
                }
                if (fp) {
                    this.cameraManager.copyPositionOfCameraToFirstPersonCamera(fp)
                    if (this.managerType == ManagerType.EDITOR) {
                        if (scene.sceneEntity.findByName("cameraBoxEntity") == null) {
                            const c = createCameraBox(this.app)
                            c.setPosition(fp.getWorldTransform().getTranslation())
                            c.setEulerAngles(fp.getWorldTransform().getEulerAngles())
                            scene.sceneEntity.addChild(c)
                        }
                    } else {
                        scene.sceneEntity.findByName("cameraBoxEntity")?.remove()
                    }
                } else {
                    console.log("Firstpersoncamera wasn't defined on scene, we will use default")
                }
                this.sceneManager.editableScene.addChild(scene.sceneEntity)
            }

            scene.personComponents.forEach((personComponent: RenderComponent) => {
                personComponent.entity.tags.add('person')
                this.avatarManager.addAvatar(personComponent.entity)
            })

            if (scene.wallComponents) {
                // scene.wallComponents.map((wallComponent) => wallComponent.entity)
                this.walls = scene.wallComponents.map((wallComponent) => {
                    this.addPhisicsToEntity(wallComponent.entity, BODYTYPE_STATIC)
                    return wallComponent.entity
                    // const c = createCollisionBB(this.app, wallComponent.entity)
                    // c.setPosition(wallComponent.entity.getPosition())
                    // this.app.root.findByName('mainScene')?.addChild(c)
                })
            }
            if (scene.floorComponents) {
                // scene.floorComponents.map((floorComponent) => floorComponent.entity)
                scene.floorComponents.map((floorComponent) => {
                    this.addPhisicsToEntity(floorComponent.entity, BODYTYPE_STATIC)
                    // const c = createCollisionBB(this.app, floorComponent.entity)
                    return floorComponent.entity
                })
            }
            if (scene.celingComponents) {
                // scene.celingComponents.map((celingComponent) => celingComponent.entity)
                // scene.celingComponents.map((celingComponent) => {
                //     this.addPhisicsToEntity(celingComponent.entity, BODYTYPE_STATIC)
                // })
            }

            if (scene.sceneEntity) this.cameraManager.orbitCamera?.focus(scene.sceneEntity as Entity)
            else this.cameraManager.orbitCamera?.focus(this.sceneManager.editableScene)

            this.dispatchSceneChanged()
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    private addPhisicsToEntity(entity: Entity, type: any = BODYTYPE_STATIC, addRigidbody = true, addCollision = true) {
        if (!(entity instanceof Entity)) return
        if (addCollision && entity.collision === undefined) {
            const aabb = new BoundingBox()
            if (entity.render) {
                entity.render.meshInstances.forEach((meshInstance) => {
                    aabb.add(meshInstance.aabb)
                })
            }
            entity.addComponent('collision', {
                // type: 'mesh',
                // renderAsset: asset,
                type: 'box',
                halfExtents: aabb.halfExtents,
            })
        }
        if (addCollision && entity.collision) {
            entity.collision.enabled = true
            // collisionComponents = collisionComponents.concat([entity.collision])
        }
        if (addRigidbody && entity.rigidbody === undefined) {
            entity.addComponent('rigidbody', {
                type: type, // should be kinematic ? // type: BODYTYPE_KINEMATIC, // should be kinematic ?
            })
        }
        // if (entity.collision) {
        //     const b = createCollisionBB(this.app, entity)
        //     this.mainScene.addChild(b)
        // }
    }

    public loadAsyncModules() {
        const modulesToLoad: Promise<any>[] = []
        return new Promise<void>((resolve, reject) => {
            modulesToLoad.push(this.ammoManager.loadAmmo())
            Promise.all(modulesToLoad)
                .then(() => { })
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
                this.app.on('update', (dt: number) => {
                    this.diagnostic.tick(dt)
                    this.updates.forEach((updateFn) => {
                        if (typeof updateFn === 'function') {
                            updateFn(dt)
                        }
                    })
                    this.cameraManager.updates.forEach((updateFn) => {
                        if (typeof updateFn === 'function') {
                            updateFn(dt)
                        }
                    })
                    this.scriptManager.updates.forEach((updateFn) => {
                        if (typeof updateFn === 'function') {
                            updateFn(dt)
                        }
                    })
                })
                this.managerPostInitialize()
            })
            .catch((err) => {
                console.error(err)
                this.initializedError.next(err)
            })
    }
    protected async loadEditorConfiguration() {
        this._abortController = new AbortController()
        return http
            .get<Configuration>(`/static/common/editor-configuration.json?timestamp=${new Date()}`, {
                signal: this._abortController.signal,
            })
            .catch(() => {
                throw new Error('Predefined scenes dont exists')
            })
    }

    protected managerPostInitialize() {
        this.loadEditorConfiguration()
            .then((configuration) => {
                configuration.data.avatars.map((a) => {
                    let modelUrl = a.model
                    let imageUrl = a.image
                    if (a.model?.includes('static') && !a.model?.includes('http')) {
                        modelUrl = appConfig().STATIC_URL + a.model
                        imageUrl = appConfig().STATIC_URL + a.image
                    }

                    a.model = modelUrl
                    a.image = imageUrl
                    return a
                })
                this.animationManager.animationsDef = configuration.data.animations

                if (configuration.data.fonts) {
                    configuration.data.fonts.forEach((font) => {
                        this.assetsManager.loadFont(font)
                    })
                }

                this.initialized.next(true)
                this.managerStart()
            })
            .catch((err) => {
                this.initializedError.next(err)
            })
    }

    protected managerStart() {
        this.app.assets.prefix = appConfig().STATIC_URL
        this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
        this.app.setCanvasResolution(RESOLUTION_AUTO)
        this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio
        this.app.start()
        this.app.scene.gammaCorrection = GAMMA_SRGB
        this.app.scene.toneMapping = TONEMAP_ACES //TONEMAP_LINEAR //
        this.app.scene.exposure = 1
        this.app.scene.ambientLight = new Color(0.2, 0.2, 0.2, 1)

        this.cameraManager.setCamera('firstPersonCamera')
        this.cameraManager.addFirstPersonCameraTools()
        this._createScreenComponent()

        this.applicationStarted.next(true)
    }

    public startTraining() {
        this.cameraManager.setCamera('firstPersonCamera')

        const animationlist = Array.from(this.animationManager.animations.values())
        if (animationlist.length > 0) {
            this.avatarManager.avatars.forEach((avatar) => {
                avatar.playAnimation(animationlist[0].name)
            })
        }
        this.trainingSceneStarted.next(true)
        this.scenarioEngine.start()
        const c = this.scenarioEngine.ended.subscribe((e) => {
            if (e) {
                this.restartTraining()
                c.unsubscribe()
            }
        })
    }
    public startVRTraing() {
        if (this.webXrManager && this.webXrManager.xrManager?.active) return
        if (this.webXrManager.isAvailable()) {
            this.webXrManager
                .start()
                .then(() => {
                    console.log('Immersive VR started')
                })
                .catch((err) => {
                    console.log('Immersive VR error', err)
                })
        } else {
            console.log('Immersive VR is not available')
        }
    }
    public endVRTraing() {
        this.webXrManager.end()
    }
    public isVRSupported() {
        return this.webXrManager.isSupported()
    }
    public isVRActive() {
        return this.webXrManager.isActive()
    }
    public isVRAvailable() {
        return this.webXrManager.isAvailable()
    }

    public restartTraining() {
        this.avatarManager.avatars.forEach((avatar) => {
            avatar.stopAnimations()
        })

        if (this.webXrManager && this.webXrManager.xrManager?.active) {
            this.endVRTraing()
        }

        this.trainingSceneStarted.next(false)
        this.cameraManager.setCamera('firstPersonCamera')
    }
    public dispatchSceneChanged() {
        this.mainSceneChanged.next(this.sceneManager.mainScene)

        setTimeout(() => {
            this.app.fire('mainScene:updated', this.sceneManager.mainScene)
        }, 1)
    }

    public clearEditableScene() {
        for (let i = this.sceneManager.editableScene.children.length - 1; i >= 0; i--) {
            const c = this.sceneManager.editableScene.children[i]
            if (c instanceof Entity) {
                try {
                    traverse(c, (e) => {
                        if (e instanceof Entity) {
                            destroyEntity(e)
                        }
                    })
                } catch (err) {
                    console.error(err)
                }
                try {
                    c.destroy()
                } catch (err) {
                    console.error(err)
                }
                this.sceneManager.editableScene.removeChild(c)
            }
        }

        this.app.fire('clearEditableScene')
        this.dispatchSceneChanged()
    }

    public reset() {
        this.clearEditableScene()
        this.cameraManager.reset()
        this.avatarManager.reset()
        this.sceneManager.reset()
        this.trainingSceneStarted.next(false)
        this.sceneSelected.next(false)
        this.trainingSceneLoaded.next(null)
        this.app.fire('reset')
    }

    private _createScreenComponent = () => {
        if (!this.app.systems.screen) return
        this.screenEntity = new Entity('screen')

        this.screenEntity.addComponent('screen', {
            referenceResolution: new Vec2(this.app.graphicsDevice.width, this.app.graphicsDevice.height),
            screenSpace: true,
            scaleMode: SCALEMODE_NONE,
        })
        this.sceneManager.mainScene.addChild(this.screenEntity)
        // this.app.root.addChild(this.screenEntity)

        this.scenarioEngine.createScenarioScreenContainer()
        if (this.scenarioEngine.scenarioEngineScreenEntity) {
            this.screenEntity?.addChild(this.scenarioEngine.scenarioEngineScreenEntity)
        }
    }
}
