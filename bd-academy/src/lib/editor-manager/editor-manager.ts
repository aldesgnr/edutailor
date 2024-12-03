import {
    Asset,
    BODYTYPE_STATIC,
    BoundingBox,
    CollisionComponent,
    Entity,
    FILLMODE_FILL_WINDOW,
    GAMMA_SRGB,
    Layer,
    MeshInstance,
    RESOLUTION_AUTO,
    TONEMAP_ACES,
    Vec3,
} from 'playcanvas'
import { GltfExporter } from 'playcanvas/build/playcanvas-extras.mjs/exporters/gltf-exporter'
import { BehaviorSubject, of } from 'rxjs'
import { appConfig } from '../../app.config'
import { http } from '../../interceptors/axios'
import Avatar from '../avatar-manager/avatar'
import { ObjectCollision } from '../object-collision/object-collision'
import { ObjectOutlineHelper } from '../object-selector/object-outline-helper'
import { TransofrmControlModes } from '../transform-controls/transform-controls'
import { createCameraBox, getPersonEntity } from '../utils/playcanvas-utils'
import { createNewTrainingSceneData } from '../utils/training-utils'
import ViewerManager, { ManagerType } from '../viewer-manager/viewer-manager'
import { AssetInfo, AvatarInfo, Scene } from './editor.types'

/**
 * EditorManager
 * @description EditorManager is responsible for loading configuration, scenes, assets, avatars, and managing editor scene.
 */
export class EditorManager extends ViewerManager {
    /** Publics */
    // public readonly canvas: HTMLCanvasElement
    public selectedAvatar = new BehaviorSubject<Avatar | null>(null)
    public objectToReplace = new BehaviorSubject<Entity | null>(null)
    public selectedAsset = new BehaviorSubject<Entity | null>(null)
    public replaceableElements = new BehaviorSubject<Asset[]>([])
    public editableSceneChanged = new BehaviorSubject<Entity | null>(null)
    public assets = new Map<string, Asset>()
    /** Privates */
    private _selectedObjectOutlineHelper: ObjectOutlineHelper | undefined
    private _objectCollision: ObjectCollision | undefined
    private _hideWalls = false
    // private walls: Entity[] = []
    public possibleScenes = new BehaviorSubject<Scene[]>([])
    public predefinedAvatars = new BehaviorSubject<AvatarInfo[]>([])
    public predefinedAssets = new BehaviorSubject<AssetInfo[]>([])

    constructor() {
        super(ManagerType.EDITOR)
        this.debug = appConfig().EDITOR_DEBUG
    }

    set transformControlsMode(mode: TransofrmControlModes) {
        if (!this.scriptManager.transformControls) return
        this.scriptManager.transformControls.mode = mode
    }
    get editableScene() {
        return this.sceneManager.editableScene
    }
    get editorCamera() {
        return this.cameraManager.editorCamera
    }

    get selectedObject() {
        if (!this.scriptManager.objectSelector) return of(null)
        return this.scriptManager.objectSelector?.selectedObject.asObservable()
    }
    get activeCamera() {
        return this.cameraManager.activeCamera.asObservable()
    }
    get collisionsOfSelectedObject() {
        if (!this._objectCollision) return of([])
        return this._objectCollision.collisionsOfSelectedObject.asObservable()
    }

    protected managerPostInitialize() {
        this.loadEditorConfiguration()
            .then((configuration) => {
                this.possibleScenes.next(configuration.data.scenes)
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
                this.predefinedAvatars.next(configuration.data.avatars)
                this.predefinedAssets.next(configuration.data.assets)
                this.animationManager.animationsDef = configuration.data.animations

                this.scriptManager.objectSelector?.hoveredObject.subscribe(() => {
                    // return console.log('hoveredObject', hoveredObject)
                })
                this.initialized.next(true)
                this.managerStart()
            })
            .catch((err) => {
                this.initializedError.next(err)
            })
    }
    public async loadTrainingScene(trainingSceneUUID: string) {
        const r = await super.loadTrainingScene(trainingSceneUUID)
        this._addObjectSelectorSupport()
        this.scriptManager.addHoveredObjectOutlineHelper()
        this.scriptManager.addSelectedObjectOutlineHelper()
        return r
    }

    public managerStart() {
        this.app.assets.prefix = appConfig().STATIC_URL
        this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
        this.app.setCanvasResolution(RESOLUTION_AUTO)
        this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio
        this.app.scene.gammaCorrection = GAMMA_SRGB
        this.app.scene.toneMapping = TONEMAP_ACES
        this.app.scene.exposure = 2
        this.app.start()

        this.cameraManager.setCamera('editorCamera')
        this.cameraManager.addOrbitCameraTools()
        // this.cameraManager.addFirstPersonCameraTools()
        this.scriptManager.addTransformControlsSupport()
        this.scriptManager.addGridSupport()
        this._addHideWallSupport()

        this.cameraManager.orbitCamera?.focus(this.sceneManager.editableScene)
        this.applicationStarted.next(true)
    }
    public resetScripts() {
        this._addObjectSelectorSupport()
        this.scriptManager.addHoveredObjectOutlineHelper()
        this.scriptManager.addSelectedObjectOutlineHelper()
    }
    private _addObjectSelectorSupport() {
        this.scriptManager.addObjectSelectorSupport()
        // this.scriptManager.addObjectCollisionHelper()
        this.scriptManager.objectSelector?.selectedObject.subscribe((selectedObject) => {
            if (selectedObject === null) {
                this.selectedAvatar.next(null)
                this.objectToReplace.next(null)
            }

            if (selectedObject?.tags.has('replaceable')) {
                this.objectToReplace.next(selectedObject as any)
            } else {
                this.objectToReplace.next(null)
            }
            if (selectedObject?.tags.has('type_asset')) {
                this.selectedAsset.next(selectedObject as any)
            } else {
                this.selectedAsset.next(null)
            }

            if (selectedObject?.tags.has('person')) {
                const avatar = this.avatarManager.avatars.get((selectedObject as any).getGuid())
                if (avatar) {
                    this.selectedAvatar.next(avatar)
                } else this.selectedAvatar.next(null)
            } else {
                this.selectedAvatar.next(null)
            }

            if (selectedObject?.tags.has('avatar_element')) {
                const parentPerson = getPersonEntity(selectedObject)
                if (parentPerson) {
                    const avatar = this.avatarManager.avatars.get(parentPerson.getGuid())
                    if (avatar) {
                        this.selectedAvatar.next(avatar)
                        if (this._selectedObjectOutlineHelper) {
                            //move this to outliner to recognize what element picked
                            // this._selectedObjectOutlineHelper.outlineObjectEntity = avatar.entity
                        }
                    } else this.selectedAvatar.next(null)
                }
            }
        })
    }

    public createNewTrainingScene(uuid: string) {
        this.loadingPercent.next(0.01)
        this.reset()
        this.trainingSceneUUID = uuid
        this._abortController = new AbortController()
        const newTrainingSceneData = createNewTrainingSceneData(uuid)
        this._trainingScene = newTrainingSceneData as any
        this.trainingSceneLoaded.next(this._trainingScene as any)
        this.sceneSelected.next(false)
        this.loadingPercent.next(1)
    }

    public async saveScene() {
        this.loadingPercent.next(0.01)
        try {
            const { scene, glb } = await this.exportScene()
            if (glb === null) throw new Error('Problem with export glb scene')
            const sceneSave = http.post(
                `/static/training-scene/${this.trainingSceneUUID}/${this.trainingSceneUUID}.json`,
                new Blob([JSON.stringify(scene)], { type: 'text/json' }),
            )
            const glbSave = http.post(
                `/static/training-scene/${this.trainingSceneUUID}/${this.trainingSceneUUID}.glb`,
                new Blob([glb], { type: 'application/octet-stream' }),
            )

            return Promise.all([sceneSave, glbSave])
                .then(() => {
                    this.loadingPercent.next(1)
                    return 'Scene saved successfully'
                })
                .catch((err) => {
                    this.loadingPercent.next(1)
                    console.log(err)
                    throw new Error('Cannot save scene, try again later')
                })
        } catch (err) {
            this.loadingPercent.next(1)
            throw err
        }
    }
    public async exportScene() {
        try {
            const tmpExportData = {
                baseInfo: {
                    title: "Wanda in da doctor's office",
                    description: "Wanda is in the doctor's office",
                    locale: 'pl-PL',
                },
                training: {
                    scene: this.sceneManager.exportScene(),
                    avatars: this.avatarManager.exportAvatarsAsJson(),
                },
            }

            const glbSceneData = await new GltfExporter().build(this.editableScene, { maxTextureSize: 2048 })

            return { scene: tmpExportData, glb: glbSceneData }
        } catch (err) {
            console.error(err)
            this.loadingPercent.next(1)
            return { scene: null, glb: null }
        }
    }

    private _addHideWallSupport() {
        this.cameraManager.activeCamera.subscribe((activeCamera) => {
            if (activeCamera?.name === 'editorCamera') {
                if (this.scriptManager.objectSelector) this.scriptManager.objectSelector.enable = true
                this._hideWalls = true
            } else {
                if (this.scriptManager.objectSelector) this.scriptManager.objectSelector.enable = false
                this._hideWalls = false
            }
        })
        this.cameraManager.orbitCamera?.positionChanged.subscribe((position) => {
            this.hideWalls(position)
        })
    }

    public replaceAvatar(avatarInfo: AvatarInfo) {
        const personEntityToReplace = this.selectedAvatar.value
        if (personEntityToReplace) {
            this.loadingPercent.next(0.01)
            personEntityToReplace
                .replaceAvatar(avatarInfo)
                .then(() => {
                    this.selectObject(null)
                    this.loadingPercent.next(1)
                    this.dispatchSceneChanged()
                })
                .catch(() => {
                    this.loadingPercent.next(1)
                })
        }
    }

    public resetAvatar() {
        this.selectedAvatar.value?.reset()
        this.selectObject(null)
    }
    public replaceAsset(assetReplaceWith: AssetInfo) {
        const objectToReplace = this.objectToReplace.value
        let parentGuid = null
        if (objectToReplace) {
            this.loadingPercent.next(0.01)
            if (!this._trainingScene) return
            const assetEntity = this.assetsManager.getAssetEntity(assetReplaceWith)

            if (objectToReplace.parent) {
                parentGuid = (objectToReplace.parent as Entity).getGuid()
            }
            if (parentGuid == null) return

            objectToReplace.children?.forEach((child) => {
                objectToReplace.removeChild(child)
            })
            objectToReplace.removeComponent('render')
            objectToReplace.removeComponent('rigidbody')
            objectToReplace.removeComponent('collision')

            assetEntity.setLocalScale(objectToReplace.getLocalScale().clone())
            assetEntity.setLocalEulerAngles(objectToReplace.getLocalEulerAngles().clone())
            assetEntity.setLocalPosition(objectToReplace.getLocalPosition().clone())

            this.app.root.findByGuid(parentGuid)?.addChild(assetEntity)

            objectToReplace.destroy()
            objectToReplace.remove()
            this.loadingPercent.next(1)
            this.dispatchSceneChanged()
            this.scriptManager.objectSelector?.selectedObject.next(null)
        }
    }

    public addAsset(asset: AssetInfo) {
        this.loadingPercent.next(0.1)
        const assetEntity = this.assetsManager.getAssetEntity(asset)
        this.app.root.findByName('Room')?.addChild(assetEntity)
        this.dispatchSceneChanged()
        this.scriptManager.objectSelector?.selectedObject.next(null)
        this.loadingPercent.next(1)
    }

    public removeSelectedAsset() {
        this.loadingPercent.next(0.1)
        const selectedObject = this.selectedAsset.value
        if (!selectedObject) return
        selectedObject.destroy()
        this.dispatchSceneChanged()
        this.selectedAsset.next(null)
        this.loadingPercent.next(1)
    }

    public showFirstpersonPreview = () => {
        this.cameraManager.showFirstpersonPreview()
    }
    public dispatchSceneChanged() {
        this.editableSceneChanged.next(this.sceneManager.editableScene)
        this.mainSceneChanged.next(this.sceneManager.mainScene)
        // const collisionComponents = this.addCollisionComponentToEntities()
        // if (this._objectCollision) {
        //     this._objectCollision.collisionComponents = collisionComponents
        // }
        setTimeout(() => {
            this.app.fire('editableScene:updated', this.sceneManager.editableScene)
            this.app.fire('mainScene:updated', this.sceneManager.editableScene)
        }, 1)
    }
    public selectObject = (entity: Entity | null) => {
        if (this.scriptManager.objectSelector) {
            this.scriptManager.objectSelector.selectedObject.next(entity)
            this.app.fire('objectSelector:selected', this.scriptManager.objectSelector.selectedObject.value)
        }
        //move this anly when draggin elements on scene.
    }

    public izometricView = () => {
        if (!this.cameraManager.orbitCamera) return
        this.cameraManager.orbitCamera.pitch = -45
        this.cameraManager.orbitCamera.yaw = 45
    }
    public hideWalls(camPosition: Vec3) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wallDistances: any = []
        this.walls.forEach((wall) => {
            wall.enabled = true
        })

        if (this._hideWalls === false) return
        this.walls.forEach((wall) => {
            wallDistances.push({
                distance: wall.getPosition().distance(camPosition),
                entity: wall,
            })
        })
        const sortable = wallDistances.sort(
            (
                a: {
                    distance: number
                    entity: Entity
                },
                b: {
                    distance: number
                    entity: Entity
                },
            ) => {
                return a.distance - b.distance
            },
        )
        sortable.splice(0, 2).forEach((wall: { distance: number; entity: Entity }) => {
            wall.entity.enabled = false
        })
    }

    public async loadPredefinedScene(scene: Scene) {
        this.loadingPercent.next(0.01)
        return this.sceneManager
            .loadScene(scene)
            .then((scene) => {
                console.log(scene);
                const propablyFirstPersonCamera = scene.camerasComponents.find(
                    (c) => c.entity.name === 'FirstPerson' || c.entity.name === 'firstPersonCamera' || c.entity.name === 'FirstPersonCamera',
                )
                if (scene.sceneEntity) {
                    this.sceneManager.editableScene.addChild(scene.sceneEntity)
                }

                if (propablyFirstPersonCamera) {
                    if (propablyFirstPersonCamera.entity) {
                        this.cameraManager.firstPersonCamera?.setLocalRotation(propablyFirstPersonCamera.entity.getLocalRotation())
                        this.cameraManager.firstPersonCamera?.setRotation(propablyFirstPersonCamera.entity.getRotation())
                        this.cameraManager.firstPersonCamera?.setLocalPosition(propablyFirstPersonCamera.entity.getLocalPosition())
                        this.cameraManager.firstPersonCamera?.setPosition(propablyFirstPersonCamera.entity.getPosition())
                    }
                } else {
                    console.log("Firstpersoncamera wasn't defined on scene, we will use default")
                }

                if (scene.personComponents.length > 0) {
                    scene.personComponents.forEach((personComponent) => {
                        personComponent.entity.tags.add('person')
                        this.avatarManager.addAvatar(personComponent.entity)
                    })
                }
                if (scene.wallComponents) {
                    this.walls = scene.wallComponents.map((wallComponent) => wallComponent.entity)
                }
                if (scene.floorComponents) {
                    scene.floorComponents.map((floorComponent) => floorComponent.entity)
                }

                if (scene.sceneEntity) this.cameraManager.orbitCamera?.focus(scene.sceneEntity as Entity)
                else this.cameraManager.orbitCamera?.focus(this.sceneManager.editableScene)

                if (scene.sceneEntity && scene.sceneEntity.findByName("cameraBoxEntity") == null && propablyFirstPersonCamera) {
                    const c = createCameraBox(this.app)
                    c.setPosition(propablyFirstPersonCamera.entity.getWorldTransform().getTranslation())
                    c.setEulerAngles(propablyFirstPersonCamera.entity.getWorldTransform().getEulerAngles())
                    scene.sceneEntity.addChild(c)
                }

                this.sceneSelected.next(true)
                this.loadingPercent.next(1)
                this.dispatchSceneChanged()
                return 'Scene loaded successfully'
            })
            .catch((err) => {
                this.sceneSelected.next(false)
                this.loadingPercent.next(1)
                this.dispatchSceneChanged()
                return err.message
            })
    }

    public addCollisionComponentToEntities = () => {
        let collisionComponents: CollisionComponent[] = []
        const replacable = this.sceneManager.editableScene.findByTag('replaceable')
        if (replacable.length === 0) {
            return collisionComponents
        }

        replacable.forEach((entity: any) => {
            if (!(entity instanceof Entity)) return
            if (!entity.render) return
            // const asset = this.app.assets.get(entity.render.asset)
            if (entity.collision === undefined) {
                const aabb = new BoundingBox()
                if (entity.render) {
                    entity.render.meshInstances.forEach((meshInstance: MeshInstance) => {
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
            if (entity.rigidbody === undefined) {
                entity.addComponent('rigidbody', {
                    type: BODYTYPE_STATIC, // should be kinematic ?
                    // type: BODYTYPE_KINEMATIC, // should be kinematic ?
                })
            }
            if (entity.collision) {
                entity.collision.enabled = true
                collisionComponents = collisionComponents.concat([entity.collision])
            }

            // meshInstances = meshInstances.concat(entity.render.meshInstances)
        })
        return collisionComponents
    }
}
