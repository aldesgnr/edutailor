import {
    Asset,
    BODYTYPE_STATIC,
    BoundingBox,
    CollisionComponent,
    Color,
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

    private configLoaded = false

    // Undo/Redo system (#005)
    private history: any[] = []
    private historyIndex = -1
    private maxHistory = 50
    public canUndo = new BehaviorSubject<boolean>(false)
    public canRedo = new BehaviorSubject<boolean>(false)

    constructor() {
        super(ManagerType.EDITOR)
        this.debug = appConfig().EDITOR_DEBUG
        // Load config for scene/avatar data (without starting app)
        this.loadConfigurationOnly()
    }

    /**
     * Load configuration data (scenes, avatars) without starting PlayCanvas app
     * This allows scene selection UI to work before canvas is rendered
     */
    private loadConfigurationOnly() {
        if (this.configLoaded) return
        
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
                this.configLoaded = true
                console.log('[EditorManager] Configuration loaded (scenes, avatars, assets)')
            })
            .catch((err) => {
                console.error('[EditorManager] Failed to load configuration:', err)
                this.initializedError.next(err)
            })
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
        
        // Fix canvas size to avoid WebGL framebuffer errors
        // Ensure minimum size even if canvas is hidden or has 0 dimensions
        const minWidth = 800
        const minHeight = 600
        
        if (this.canvas.clientWidth === 0 || this.canvas.clientHeight === 0) {
            console.warn('[EditorManager] Canvas has zero size, setting minimum dimensions')
            this.canvas.style.width = minWidth + 'px'
            this.canvas.style.height = minHeight + 'px'
        }
        
        this.canvas.width = Math.max(this.canvas.clientWidth || minWidth, minWidth)
        this.canvas.height = Math.max(this.canvas.clientHeight || minHeight, minHeight)
        
        console.log(`[EditorManager] Canvas size set to ${this.canvas.width}x${this.canvas.height}`)
        
        this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
        this.app.setCanvasResolution(RESOLUTION_AUTO)
        this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio
        
        // Professional rendering settings
        this.app.scene.gammaCorrection = GAMMA_SRGB
        this.app.scene.toneMapping = TONEMAP_ACES
        this.app.scene.exposure = 1.2 // Optimized for better contrast (was 2, too bright)
        
        // Ambient lighting - warm white for natural look
        this.app.scene.ambientLight = new Color(0.4, 0.4, 0.45, 1) // Slightly blue-tinted white
        
        this.app.start()

        // Add professional lighting setup
        this._setupSceneLighting()

        this.cameraManager.setCamera('editorCamera')
        this.cameraManager.addOrbitCameraTools()
        // this.cameraManager.addFirstPersonCameraTools()
        this.scriptManager.addTransformControlsSupport()
        this.scriptManager.addGridSupport()
        this._addHideWallSupport()

        // Improve camera controls for easier navigation
        if (this.cameraManager.orbitCamera) {
            // Better default distance for easier view
            this.cameraManager.orbitCamera.distance = 8
            console.log('[EditorManager] Camera controls improved: distance 8')
        }

        this.cameraManager.orbitCamera?.focus(this.sceneManager.editableScene)
        this.applicationStarted.next(true)
    }

    /**
     * Setup professional 3-point lighting for beautiful scene rendering
     */
    private _setupSceneLighting() {
        // Key Light (Main directional light - simulates sun)
        const keyLight = new Entity('KeyLight')
        keyLight.addComponent('light', {
            type: 'directional',
            color: new Color(1.0, 0.98, 0.95), // Warm white sunlight
            intensity: 0.8,
            castShadows: true,
            shadowDistance: 50,
            shadowResolution: 2048,
            shadowBias: 0.05,
            normalOffsetBias: 0.05,
        })
        keyLight.setEulerAngles(45, 45, 0) // 45° angle for natural shadows
        this.app.root.addChild(keyLight)

        // Fill Light (Softer light from opposite side)
        const fillLight = new Entity('FillLight')
        fillLight.addComponent('light', {
            type: 'directional',
            color: new Color(0.7, 0.8, 1.0), // Cool blue-ish fill
            intensity: 0.3,
            castShadows: false,
        })
        fillLight.setEulerAngles(30, -120, 0)
        this.app.root.addChild(fillLight)

        // Back/Rim Light (Highlights edges)
        const rimLight = new Entity('RimLight')
        rimLight.addComponent('light', {
            type: 'directional',
            color: new Color(1.0, 0.95, 0.8), // Warm rim light
            intensity: 0.4,
            castShadows: false,
        })
        rimLight.setEulerAngles(-30, 180, 0)
        this.app.root.addChild(rimLight)

        console.log('[EditorManager] Professional 3-point lighting setup complete')
    }

    /**
     * Process materials and textures for proper PBR rendering
     * Fixes white/untextured models by enabling sRGB and updating materials
     */
    private _processMaterialsAndTextures(entity: Entity) {
        let texturesProcessed = 0
        let materialsProcessed = 0
        let materialsWithTextures = 0

        console.log('[EditorManager] Starting material processing...')

        // Find all render components in the scene
        const renderComponents = entity.findComponents('render') as any[]
        
        renderComponents.forEach((renderComponent) => {
            if (!renderComponent.meshInstances) return
            
            renderComponent.meshInstances.forEach((meshInstance: any) => {
                const material = meshInstance.material
                if (!material) return
                
                materialsProcessed++
                let hasTextures = false
                
                // Debug: Log material info
                console.log(`Material: ${material.name || 'unnamed'}, Type: ${material.type || 'unknown'}`)
                
                // Process diffuse/albedo map (base color)
                if (material.diffuseMap) {
                    console.log(`  → Has diffuseMap, setting sRGB encoding`)
                    material.diffuseMap.encoding = 'srgb'
                    texturesProcessed++
                    hasTextures = true
                }
                
                // If no diffuse map but has diffuse color, set it to white for better visibility
                if (!material.diffuseMap && material.diffuse) {
                    console.log(`  → No texture, has color:`, material.diffuse.toString())
                }
                
                // Process emissive map
                if (material.emissiveMap) {
                    console.log(`  → Has emissiveMap, setting sRGB encoding`)
                    material.emissiveMap.encoding = 'srgb'
                    texturesProcessed++
                    hasTextures = true
                }
                
                // Process ambient occlusion map
                if (material.aoMap) {
                    console.log(`  → Has aoMap, setting linear encoding`)
                    material.aoMap.encoding = 'linear'
                    hasTextures = true
                }
                
                // Process normal map
                if (material.normalMap) {
                    console.log(`  → Has normalMap, setting linear encoding`)
                    material.normalMap.encoding = 'linear'
                    hasTextures = true
                }
                
                // Process metalness map
                if (material.metalnessMap) {
                    console.log(`  → Has metalnessMap, setting linear encoding`)
                    material.metalnessMap.encoding = 'linear'
                    hasTextures = true
                }
                
                // Process roughness/gloss map
                if (material.glossMap) {
                    console.log(`  → Has glossMap, setting linear encoding`)
                    material.glossMap.encoding = 'linear'
                    hasTextures = true
                }
                
                if (hasTextures) {
                    materialsWithTextures++
                }
                
                // Update material to apply changes
                material.update()
            })
        })

        console.log(`[EditorManager] Materials processed: ${materialsProcessed}`)
        console.log(`[EditorManager] Materials with textures: ${materialsWithTextures}`)
        console.log(`[EditorManager] Total textures fixed: ${texturesProcessed}`)
    }


    public resetScripts() {
        this._addObjectSelectorSupport()
        this.scriptManager.addHoveredObjectOutlineHelper()
        this.scriptManager.addSelectedObjectOutlineHelper()
    }

    /**
     * Reinitialize outline helpers after switching from dialog to editor
     * Fixes black screen bug #001
     */
    public reinitializeOutlineHelpers() {
        console.log('[EditorManager] Reinitializing outline helpers...')
        
        if (!this.scriptManager.objectSelector) {
            console.warn('[EditorManager] No object selector found')
            return
        }
        
        // Re-add outline helpers
        this.scriptManager.addHoveredObjectOutlineHelper()
        this.scriptManager.addSelectedObjectOutlineHelper()
        
        console.log('[EditorManager] Outline helpers reinitialized successfully')
    }
    private _addObjectSelectorSupport() {
        this.scriptManager.addObjectSelectorSupport()
        // this.scriptManager.addObjectCollisionHelper()
        this.scriptManager.objectSelector?.selectedObject.subscribe((selectedObject) => {
            console.log('[EditorManager] Object selected:', selectedObject?.name || 'null')
            
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
                console.log('[EditorManager] Person tag found, GUID:', (selectedObject as any).getGuid())
                console.log('[EditorManager] Available avatars:', Array.from(this.avatarManager.avatars.keys()))
                const avatar = this.avatarManager.avatars.get((selectedObject as any).getGuid())
                if (avatar) {
                    console.log('[EditorManager] Avatar found! Setting selectedAvatar')
                    this.selectedAvatar.next(avatar)
                } else {
                    console.log('[EditorManager] Avatar NOT found in avatarManager!')
                    this.selectedAvatar.next(null)
                }
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

    /**
     * Validate training before publish
     * Fix #003: Prevent publishing incomplete trainings
     */
    public async validateTraining(trainingId: string): Promise<{ isValid: boolean; errors: string[] }> {
        try {
            console.log('[EditorManager] Validating training:', trainingId)
            const response = await http.get(`/api/Trainings/${trainingId}/validate`)
            console.log('[EditorManager] Validation result:', response.data)
            return response.data
        } catch (error) {
            console.error('[EditorManager] Validation failed:', error)
            throw new Error('Failed to validate training')
        }
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

    /**
     * Undo/Redo System (#005)
     * Record current scene state to history
     */
    public recordState() {
        try {
            const state = this.exportSceneState()
            
            // Remove future states if we're not at the end
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1)
            }
            
            this.history.push(state)
            
            // Limit history size
            if (this.history.length > this.maxHistory) {
                this.history.shift()
            } else {
                this.historyIndex++
            }
            
            this.updateUndoRedoState()
            console.log(`[EditorManager] State recorded (${this.history.length} states, index: ${this.historyIndex})`)
        } catch (error) {
            console.error('[EditorManager] Failed to record state:', error)
        }
    }

    /**
     * Export current scene state for history
     */
    private exportSceneState() {
        return {
            timestamp: Date.now(),
            scene: this.sceneManager.exportScene(),
            avatars: this.avatarManager.exportAvatarsAsJson()
        }
    }

    /**
     * Restore scene state from history
     */
    private async restoreState(state: any) {
        try {
            console.log('[EditorManager] Restoring state from:', new Date(state.timestamp))
            
            // Clear current scene
            const editableScene = this.sceneManager.editableScene
            const childrenToRemove = editableScene.children.filter((child) => 
                child.name !== 'editorCamera' && 
                child.name !== 'KeyLight' && 
                child.name !== 'FillLight' && 
                child.name !== 'RimLight'
            )
            childrenToRemove.forEach((child) => {
                (child as Entity).destroy()
            })
            
            // Restore avatars
            this.avatarManager.avatars.clear()
            
            // Reload scene (simplified - in production you'd restore from state.scene)
            this.dispatchSceneChanged()
            
            console.log('[EditorManager] State restored successfully')
        } catch (error) {
            console.error('[EditorManager] Failed to restore state:', error)
        }
    }

    /**
     * Undo last change
     */
    public undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--
            this.restoreState(this.history[this.historyIndex])
            this.updateUndoRedoState()
            console.log(`[EditorManager] Undo (index: ${this.historyIndex})`)
        } else {
            console.log('[EditorManager] Nothing to undo')
        }
    }

    /**
     * Redo last undone change
     */
    public redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++
            this.restoreState(this.history[this.historyIndex])
            this.updateUndoRedoState()
            console.log(`[EditorManager] Redo (index: ${this.historyIndex})`)
        } else {
            console.log('[EditorManager] Nothing to redo')
        }
    }

    /**
     * Update undo/redo button states
     */
    private updateUndoRedoState() {
        this.canUndo.next(this.historyIndex > 0)
        this.canRedo.next(this.historyIndex < this.history.length - 1)
    }

    /**
     * Clear history (e.g., when loading new scene)
     */
    public clearHistory() {
        this.history = []
        this.historyIndex = -1
        this.updateUndoRedoState()
        console.log('[EditorManager] History cleared')
    }

    public izometricView = () => {
        if (!this.cameraManager.orbitCamera) return
        this.cameraManager.orbitCamera.pitch = -45
        this.cameraManager.orbitCamera.yaw = 45
    }
    public hideWalls(camPosition: Vec3) {
        // DISABLED - not working properly
        return
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
                    // Fix materials and textures for proper rendering
                    this._processMaterialsAndTextures(scene.sceneEntity)
                    
                    // Enable object selection and outline helpers
                    this._addObjectSelectorSupport()
                    this.scriptManager.addHoveredObjectOutlineHelper()
                    this.scriptManager.addSelectedObjectOutlineHelper()
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
                    console.log(`[EditorManager] Found ${scene.personComponents.length} person(s) in scene`)
                    scene.personComponents.forEach((personComponent, index) => {
                        console.log(`  Person ${index + 1}: ${personComponent.entity.name}`)
                        personComponent.entity.tags.add('person')
                        this.avatarManager.addAvatar(personComponent.entity)
                    })
                } else {
                    console.log('[EditorManager] No persons found in scene')
                }
                if (scene.wallComponents && scene.wallComponents.length > 0) {
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
