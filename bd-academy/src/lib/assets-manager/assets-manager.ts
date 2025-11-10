import { AppBase, Application, Asset, BODYTYPE_STATIC, Entity, Quat, Vec3 } from 'playcanvas'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'
import { appConfig } from '../../app.config'
import { AssetInfo, FontInfo, JSONEntity, JSONSceneExport } from '../editor-manager/editor.types'
import { ManagerType } from '../viewer-manager/viewer-manager'

export default class AssetsManager {
    private app: Application | AppBase
    private _trainingUUID: string | null = null
    constructor(app: Application | AppBase) {
        this.app = app
    }

    set trainingSceneUUID(trainingUUID: string | null) {
        this._trainingUUID = trainingUUID
    }

    private getAssetsToLoad(entities: Record<string, JSONEntity> | undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assetsToLoad: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const materialAssetsToLoad: any[] = []
        if (entities === undefined) return { assetsToLoad, materialAssetsToLoad }
        Object.keys(entities).forEach((k) => {
            if (entities[k]?.components?.render?.asset) {
                assetsToLoad.push(entities[k].components.render.asset)
            }
            if (entities[k]?.components?.render?.materialAssets) {
                entities[k].components.render.materialAssets.forEach((m) => {
                    if (m === null) return
                    materialAssetsToLoad.push(m)
                })
            }
        })
        return { assetsToLoad, materialAssetsToLoad }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public loadSceneAssets(scene: JSONSceneExport) {
        Object.keys(scene.assets).forEach((k) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const assetDef = scene.assets[k as any]
            let asset: Asset | undefined = undefined
            if (assetDef.type === 'texture') {
                const assetPath = `/static/training/${this._trainingUUID}/${assetDef.file.filename}`
                asset = new Asset(k, assetDef.type, {
                    url: assetPath,
                })
            } else if (assetDef.type === 'material') {
                asset = new Asset(k, assetDef.type, {}, assetDef.data)
            }
            if (asset === undefined) return
            this.app.assets.add(asset)
            asset.once('load', () => {
                console.log('loaded asset', asset)
            })
            this.app.assets.load(asset)
        })
    }

    public createAssetEntityInstance(assetInfo: AssetInfo) {
        const asset = this.app.assets.getByUrl(assetInfo.model)
        if (!asset) return console.log('asset not found')
        setApplication(this.app)
        const assetEntity = asset.resource?.instantiateRenderEntity()
        assetEntity.tags.add('avatar')

        assetEntity.children.forEach((child: Entity) => {
            child.tags.add('avatar_element')
        })
        return assetEntity
    }

    public async loadFont(font: FontInfo) {
        return new Promise((resolve, reject) => {
            const filename = font.name
            const url = font.url
            let assetURL = font.url
            if (url?.includes('static') && !url?.includes('http')) {
                assetURL = appConfig().STATIC_URL + url
            }
            const file = {
                url: assetURL,
                // filename: filename,
            }

            const asset = new Asset(filename, 'font', file)
            asset.once('load', (font) => {
                resolve(font)
            })
            asset.on('error', (err) => {
                console.log(err)
                reject(err)
            })

            this.app.assets.add(asset)
            this.app.assets.load(asset)
        })
    }
    public loadAssets(assets: AssetInfo[]) {
        assets.forEach((asset) => {
            this.loadGlbAsset(asset)
        })
    }
    public getAssetEntity(asset: AssetInfo) {
        const assetEntity = this.createAssetEntityInstance(asset)
        assetEntity.tags.add('replaceable')
        assetEntity.tags.add('type_asset')
        const assetEntityAsset = this.app.assets.get(assetEntity.render.asset)
        assetEntity.addComponent('collision', {
            type: 'mesh',
            renderAsset: assetEntityAsset,
        })
        assetEntity.addComponent('rigidbody', {
            type: BODYTYPE_STATIC,
        })

        const transform = this.app.root.findByName('Room')?.getWorldTransform()
        if (transform) {
            assetEntity.worldTransform.set(transform)
            assetEntity.setLocalScale(new Vec3(1, 1, 1))
            assetEntity.setLocalRotation(new Quat())
            assetEntity.setLocalPosition(new Vec3())
        }

        return assetEntity
    }

    public loadGlbAsset(assetInfo: AssetInfo) {
        return new Promise((resolve, reject) => {
            try {
                this._loadGlbContainerFromUrl(assetInfo.model, {}, assetInfo.id, () => {
                    resolve(true)
                    // const asset = this.app.assets.getByUrl(assetInfo.model)
                    // if (!asset) return

                    // setApplication(this.app)
                    // const assetEntity = asset.resource?.instantiateRenderEntity()
                    // assetEntity.tags.add('avatar')

                    // assetEntity.children.forEach((child: Entity) => {
                    //     child.tags.add('avatar_element')
                    // })

                    // const transform = this._entity.getWorldTransform()
                    // const worldScale = transform.getScale()
                    // avatarEntity.worldTransform.set(transform)
                    // avatarEntity.setLocalScale(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z)
                    // this._cleanEntityChildren(this._entity)
                    // this._entity.render?.hide()
                    // if (this._entity.rigidbody) this._entity.removeComponent('rigidbody')
                    // if (this._entity.collision) this._entity.removeComponent('collision')
                    // this._entity.addChild(avatarEntity)
                    // avatarEntity.render?.material.update()
                    // resolve(true)
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _loadGlbContainerFromUrl(url: string, options: any, assetName: string, callback: any) {
        const filename = assetName + '.glb'

        let assetURL = url
        if (url?.includes('static') && !url?.includes('http')) {
            assetURL = appConfig().STATIC_URL + url
        }
        const file = {
            url: assetURL,
            filename: filename,
        }

        const asset = new Asset(filename, 'container', file, {}, options)
        asset.once('load', (containerAsset) => {
            if (callback) {
                // As we play animations by name, if we have only one animation, keep it the same name as
                // the original container otherwise, postfix it with a number
                const animations = containerAsset.resource.animations
                if (animations.length == 1) {
                    animations[0].name = assetName
                } else if (animations.length > 1) {
                    for (let i = 0; i < animations.length; ++i) {
                        animations[i].name = assetName + ' ' + i.toString()
                    }
                }

                for (let i = 0; i < containerAsset.resource.materials.length; i++) {
                    containerAsset.resource.materials[i].tags.add(filename)
                }

                for (let i = 0; i < containerAsset.resource.textures.length; i++) {
                    containerAsset.resource.textures[i].tags.add(filename)
                }
                callback({}, containerAsset)
            }
        })

        this.app.assets.add(asset)
        this.app.assets.load(asset)

        return asset
    }
}
