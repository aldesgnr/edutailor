import {
    AppBase,
    Application,
    Asset,
    AssetListLoader,
    CameraComponent,
    Color,
    Entity,
    EnvLighting,
    PIXELFORMAT_RGBA8,
    RenderComponent,
    TEXTURETYPE_DEFAULT,
    TEXTURETYPE_RGBM,
    Texture,
    Vec3,
} from 'playcanvas'
import { appConfig } from '../../app.config'
import RenderComponentExport from '../component-data/component-data-export'
import { JSONEntity, JSONSceneExport, Scene } from '../editor-manager/editor.types'
// import { GltfExporter } from 'playcanvas/build/playcanvas-extras.mjs/exporters/gltf-exporter'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'
import { colorToArr, vec3toArr } from '../utils/playcanvas-utils'
export default class SceneManager {
    private app: Application | AppBase
    private sceneAssets = new Map<string, Asset>()
    private _activeScene: Entity | null = null
    private _mainScene: Entity = new Entity('mainScene')
    private _editableScene: Entity = new Entity('editableScene')

    constructor(app: Application | AppBase) {
        this.app = app
    }

    get editableScene() {
        return this._editableScene
    }
    get mainScene() {
        return this._mainScene
    }
    public reset() {
        this._activeScene?.destroy()
        this._activeScene = null
    }
    public init() {
        this._createMainScene()
        this._createEditableScene()
        this._loadEnvironment()
    }
    private _loadEnvironment() {
        const files = [
            {
                url: appConfig().BASE_URL + '/env/skybox/env.hdr',
                filename: 'env.hdr',
            },
        ]
        const textureAsset = new Asset('skybox_equi', 'texture', {
            url: files[0].url,
            filename: files[0].filename,
        })
        textureAsset.ready(() => {
            const texture = textureAsset.resource
            if (texture.type === TEXTURETYPE_DEFAULT && texture.format === PIXELFORMAT_RGBA8) {
                texture.type = TEXTURETYPE_RGBM
            }
            this._initEnvironment(texture)
        })
        this.app.assets.add(textureAsset)
        this.app.assets.load(textureAsset)
    }
    private _initEnvironment(source: Texture) {
        const skybox = EnvLighting.generateSkyboxCubemap(source)
        const lighting = EnvLighting.generateLightingSource(source)
        const envAtlas = EnvLighting.generateAtlas(lighting)
        lighting.destroy()
        this.app.scene.envAtlas = envAtlas
        this.app.scene.skybox = skybox
        this.app.scene.skyboxIntensity = 0.8
        const skyboxlayer = this.app.scene.layers.getLayerByName('Skybox')
        if (skyboxlayer) skyboxlayer.enabled = false
    }

    public loadScene(scene: Scene): Promise<{
        personComponents: RenderComponent[]
        camerasComponents: CameraComponent[]
        wallComponents: RenderComponent[]
        floorComponents: RenderComponent[]
        celingComponents: RenderComponent[]
        furnitureComponents: RenderComponent[]
        sceneEntity: Entity | null
    }> {
        let personComponents: RenderComponent[] = []
        let camerasComponents: CameraComponent[] = []
        const furnitureComponents: RenderComponent[] = []
        let wallComponents: RenderComponent[] = []
        let floorComponents: RenderComponent[] = []
        let celingComponents: RenderComponent[] = []
        let sceneEntity: Entity | null = null

        const exisitngSceneAsset = this.sceneAssets.get(scene.name)
        if (!exisitngSceneAsset) {
            let modelUrl = scene.model
            if (scene.model?.includes('static') && !scene.model?.includes('http')) {
                modelUrl = appConfig().STATIC_URL + scene.model
            }
            this.sceneAssets.set(scene.name, new Asset(scene.name, 'container', { url: modelUrl }))
        }
        const sceneAssetArray = []
        for (const assetValue of this.sceneAssets.values()) {
            sceneAssetArray.push(assetValue)
        }
        const _assetListLoader = new AssetListLoader(sceneAssetArray, this.app.assets)

        // console.log(this.app.assets, _assetListLoader)
        const loadingPromise: Promise<{
            personComponents: RenderComponent[]
            camerasComponents: CameraComponent[]
            wallComponents: RenderComponent[]
            floorComponents: RenderComponent[]
            celingComponents: RenderComponent[]
            furnitureComponents: RenderComponent[]
            sceneEntity: Entity | null
        }> = new Promise((resolve, reject) => {
            _assetListLoader.load(() => {
                const sceneAsset = this.app.assets.find(scene.name)
                if (sceneAsset) {
                    setApplication(this.app)
                    const renderRootEntity = sceneAsset.resource?.instantiateRenderEntity()
                    sceneEntity = renderRootEntity
                    this._activeScene = sceneEntity

                    const room = (renderRootEntity as Entity).findByName('Room')
                    room?.children.forEach((child) => {
                        if (child instanceof Entity && child.render) {
                            child.tags.add('replaceable')
                            child.tags.add('type_asset')
                            furnitureComponents.push(child.render)
                        }
                    })
                    const renderComponents = renderRootEntity.findComponents('render')

                    personComponents = renderComponents.filter((render: RenderComponent) => {
                        if (render.entity.name.toLowerCase().indexOf('person') !== -1) return true
                        return false
                    })

                    wallComponents = renderComponents.filter((render: RenderComponent) => {
                        if (render.entity.name.toLowerCase().indexOf('wall') !== -1) {
                            return true
                        }
                        return false
                    })

                    floorComponents = renderComponents.filter((render: RenderComponent) => {
                        if (render.entity.name.toLowerCase().indexOf('floor') !== -1) {
                            return true
                        }
                        return false
                    })
                    celingComponents = renderComponents.filter((render: RenderComponent) => {
                        if (render.entity.name.toLowerCase().indexOf('celing') !== -1) {
                            return true
                        }
                        return false
                    })

                    camerasComponents = renderRootEntity.findComponents('camera')
                } else {
                    reject('sceneAsset not found')
                }

                resolve({
                    personComponents: personComponents,
                    camerasComponents: camerasComponents,
                    wallComponents: wallComponents,
                    floorComponents: floorComponents,
                    celingComponents: celingComponents,
                    furnitureComponents: furnitureComponents,
                    sceneEntity: sceneEntity,
                })
            })
        })
        return loadingPromise
    }

    public loadSceneGLB(trainingSceneUUID: string): Promise<{
        personComponents: RenderComponent[]
        camerasComponents: CameraComponent[]
        wallComponents: RenderComponent[]
        floorComponents: RenderComponent[]
        celingComponents: RenderComponent[]
        furnitureComponents: RenderComponent[]
        sceneEntity: Entity | null
    }> {
        let personComponents: RenderComponent[] = []
        const camerasComponents: CameraComponent[] = []
        const furnitureComponents: RenderComponent[] = []
        let wallComponents: RenderComponent[] = []
        let floorComponents: RenderComponent[] = []
        let celingComponents: RenderComponent[] = []
        let sceneEntity: Entity | null = null

        return new Promise((resolve, reject) => {
            const filename = trainingSceneUUID + '.glb'

            const assetURL = `/static/training-scene/${trainingSceneUUID}/${trainingSceneUUID}.glb`

            const file = {
                url: assetURL,
                filename: filename,
            }
            const asset = new Asset(filename, 'container', file, {})
            asset.once('load', (containerAsset) => {
                setApplication(this.app)
                sceneEntity = containerAsset.resource?.instantiateRenderEntity()
                if (!sceneEntity) return reject('Cant create Scene render')
                sceneEntity.model?.material.update()
                this._activeScene = sceneEntity
                const renderComponents = sceneEntity.findComponents('render') as RenderComponent[]
                wallComponents = renderComponents.filter((render: RenderComponent) => {
                    if (render.entity.name.toLowerCase().indexOf('wall') !== -1) {
                        return true
                    }
                    return false
                })

                floorComponents = renderComponents.filter((render: RenderComponent) => {
                    if (render.entity.name.toLowerCase().indexOf('floor') !== -1) {
                        return true
                    }
                    return false
                })
                celingComponents = renderComponents.filter((render: RenderComponent) => {
                    if (render.entity.name.toLowerCase().indexOf('celing') !== -1) {
                        return true
                    }
                    return false
                })
                personComponents = renderComponents.filter((render: RenderComponent) => {
                    if (render.entity.name.toLowerCase().indexOf('person') !== -1) return true
                    return false
                })
                resolve({
                    personComponents: personComponents,
                    camerasComponents: camerasComponents,
                    wallComponents: wallComponents,
                    floorComponents: floorComponents,
                    celingComponents: celingComponents,
                    furnitureComponents: furnitureComponents,
                    sceneEntity: sceneEntity,
                })
            })
            asset.once('error', () => {
                reject('Scene not found')
            })
            this.app.assets.add(asset)
            this.app.assets.load(asset)
        })
    }
    private _createMainScene() {
        this._mainScene = new Entity('mainScene')
    }
    private _createEditableScene() {
        this._editableScene = new Entity('editableScene')
        this._mainScene.addChild(this._editableScene)
    }
    public importScene(sceneToImport: JSONSceneExport) {
        try {
            if (sceneToImport) {
                const scene = this.app.loader.open('scene', sceneToImport)
                this.editableScene.addChild(scene.root)
                // this.app.applySceneSettings(sceneToImport.settings as any) // playcanvas.d 31940
            }
        } catch (e) {
            console.log(e)
            throw new Error('Cant import scene')
        }
    }
    public exportAssets() {
        const assets: Record<string, any> = {}
        this.app.assets.list().forEach((asset) => {
            const id = asset.id.toString()
            if (asset.type === 'texture') assets[id] = this.parseTextureAsset(asset)
            if (asset.type === 'render') assets[id] = this.parseRenderAsset(asset)
            if (asset.type === 'material') assets[id] = this.parseMaterialAsset(asset)
        })
        return assets
    }
    public parseMaterialAsset(asset: Asset) {
        return {
            name: asset.name,
            revision: 1,
            source: false,
            preload: true,
            meta: {},
            data: {
                diffuse: colorToArr(asset.resource.diffuse),
            },
            type: 'material',
            id: asset.id.toString(),
        }
    }
    public parseRenderAsset(asset: Asset) {
        return {
            name: asset.name,
            revision: 1,
            source: false,
            preload: true,
            // meta: { meshes: 1, skinned: false, vertices: 18, triangles: 16, attributes: { POSITION: 1, NORMAL: 1, TEXCOORD_0: 1 }, meshCompression: 'none' },
            data: { containerAsset: 152823004, renderIndex: 6 },
            type: 'render',
            id: asset.id.toString(),
        }
    }
    public parseTextureAsset(asset: Asset) {
        return {
            source_asset_id: '',
            tags: [],
            name: '',
            revision: 1,
            source: false,
            preload: true,
            meta: {
                compress: {
                    alpha: false,
                    normals: false,
                    dxt: false,
                    pvr: false,
                    pvrBpp: 4,
                    etc1: false,
                    etc2: false,
                    basis: false,
                    quality: 128,
                    compressionMode: 'etc',
                },
                format: asset.resource.format,
                type: asset.resource.type,
                width: asset.resource.width,
                height: asset.resource.height,
                alpha: asset.resource.width,
                depth: asset.resource.depth,
                srgb: true,
                interlaced: false,
            },
            data: {
                addressu: asset.resource.addressU,
                addressv: asset.resource.addressV,
                minfilter: asset.resource.minFilter,
                magfilter: asset.resource.magFilter,
                anisotropy: asset.resource.anisotropy,
                rgbm: asset.resource.rgbm,
                mipmaps: asset.resource.mipmaps,
            },
            type: 'texture',
            file: { filename: asset.file.filename, hash: asset.file.hash, size: asset.file.size, variants: {} },
            path: [],
            task: null,
            has_thumbnail: false,
            id: asset.id.toString(),
        }
    }
    public exportScene() {
        //clg return hereee
        const entities: Record<string, JSONEntity> = {}
        const assets: Record<number, any> = {} //= this.exportAssets()
        const materialAssets: Record<number, any> = {}
        const editableScene = this.app.root.findByName('editableScene')

        if (editableScene instanceof Entity) {
            this.parseEntity(editableScene, entities, 0)
            entities[editableScene.getGuid()].parent = null
        }

        const sceneJson: JSONSceneExport = {
            created_at: new Date().toISOString(),
            name: 'New exported scene',
            settings: {
                physics: {
                    gravity: this.app.systems.rigidbody?.gravity ? vec3toArr(this.app.systems.rigidbody.gravity) : [0, -9.81, 0],
                },
                layers: this.app.scene.layers.layerList.map((layer) => {
                    return {
                        name: layer.name,
                        enabled: layer.enabled,
                        opaqueSortMode: layer.opaqueSortMode,
                        transparentSortMode: layer.transparentSortMode,
                        id: layer.id,
                    }
                }),
                layerOrder: [0, 1, 2, 3, 4, 5],
                render: {
                    exposure: this.app.scene.exposure,
                    fog: this.app.scene.fog,
                    fog_color: colorToArr(this.app.scene.fogColor),
                    fog_destiny: this.app.scene.fogDensity,
                    fog_end: this.app.scene.fogEnd,
                    fog_start: this.app.scene.fogStart,
                    gamma_correction: this.app.scene.gammaCorrection,
                    global_ambient: colorToArr(this.app.scene.ambientLight),
                    lightmapMaxResolution: this.app.scene.lightmapMaxResolution,
                    lightmapMode: this.app.scene.lightmapMode,
                    lightmapSizeMultiplier: this.app.scene.lightmapSizeMultiplier,
                    skybox: null,
                    skyboxIntensity: this.app.scene.skyboxIntensity,
                    skyboxMip: this.app.scene.skyboxMip,
                    tonemapping: this.app.scene.toneMapping,
                    skyboxRotation: [0, 0, 0],
                    clusteredLightingEnabled: null,
                },
            },
            entities: entities,
            assets: assets,
            materialAssets: materialAssets,
        }

        return sceneJson
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parseEntity(entity: Entity, entities: Record<string, any>, depth: number = 0) {
        const parent: Entity = entity.parent ? (entity.parent as Entity) : (this.app.root as Entity)

        const exportedEntity = {
            name: entity.name || 'unnamed',
            enabled: entity.enabled,
            resource_id: entity.getGuid(),
            parent: parent.getGuid() || null,
            children: [],
            position: vec3toArr(entity.getPosition()) || [0, 0, 0],
            rotation: vec3toArr(entity.getEulerAngles()) || [0, 0, 0],
            scale: vec3toArr(entity.getLocalScale()) || [1, 1, 1],
            tags: entity.tags.list(),
            components: {},
        }

        for (const componentName in entity.c) {
            if (componentName !== 'collision') {
                let component = {}
                if (componentName === 'render' && entity.render) {
                    const er = new RenderComponentExport(entity.render)
                    // if (er.object && er.object.asset) {
                    //     // console.log('hest asset', er.object.asset)
                    // }
                    // if (er.object && er.object.materialAssets) {
                    //     er.object.materialAssets.forEach((materialAsset) => {
                    //         console.log(this.app.assets.get(materialAsset))
                    //     })
                    // }
                    component = er.object
                }
                // console.log('component', componentName, component)

                // var component = Object.assign({}, entity.c[componentName].data)
                // delete component[componentName]
                // for (var field in component) {
                //     if (component[field] && component[field].data) {
                //         component[field] = Array.from(component[field].data)
                //     }
                // }

                exportedEntity.components = { ...exportedEntity.components, ...{ [componentName]: component } }
            } else {
                console.log('for now do nothing with collision')
            }
        }

        if (entity.name === 'Root') exportedEntity.parent = null

        entities[exportedEntity.resource_id] = exportedEntity

        if (entities[parent.getGuid()]) entities[parent.getGuid()].children.push(exportedEntity.resource_id)

        entity.children.forEach((children) => {
            if (!(children instanceof Entity)) return
            if (children.getGuid()) this.parseEntity(children, entities, depth + 1)
        })
    }
}
