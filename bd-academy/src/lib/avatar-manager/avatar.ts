import { AppBase, Application, Asset, BLEND_NORMAL, BODYTYPE_STATIC, BoundingBox, Color, Entity, MeshInstance, StandardMaterial, createBox } from 'playcanvas'
import { appConfig } from '../../app.config'
import AnimationManager from '../animation-manager/animation-manager'
import { AvatarInfo } from '../editor-manager/editor.types'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'

export default class Avatar {
    private _entity: Entity
    private _model: Entity | null = null
    private app: Application | AppBase
    private boundingBoxEntity: Entity | null = null
    private _avatarInfo: AvatarInfo | null = null
    constructor(
        entity: Entity,
        app: Application | AppBase,
        private animationManager: AnimationManager,
    ) {
        this._entity = entity
        this.app = app
    }

    get getGuid() {
        return this._entity.getGuid()
    }
    get name() {
        return this._entity.name
    }
    get entity() {
        return this._entity
    }
    get model() {
        return this._model
    }
    get avatarInfo() {
        return this._avatarInfo
    }

    private addBoundingBox() {
        this.boundingBoxEntity = new Entity()
        const aabb = new BoundingBox()
        if (this._model?.model) {
            this._model.model?.meshInstances.forEach((meshInstance: MeshInstance) => {
                aabb.add(meshInstance.aabb)
            })
        }
        this.boundingBoxEntity.name = 'testbox'
        const box = createBox(this.app.graphicsDevice, {
            halfExtents: aabb.halfExtents,
            widthSegments: 1,
            lengthSegments: 1,
            heightSegments: 1,
        })
        const boxMat = new StandardMaterial()
        boxMat.depthTest = false
        boxMat.depthWrite = false

        boxMat.blendType = BLEND_NORMAL
        boxMat.opacity = 0.5

        boxMat.diffuse = new Color(1, 0, 0, 1)
        this.boundingBoxEntity.addComponent('render', {
            meshInstances: [new MeshInstance(box, boxMat)],
        })
        const transform = this._entity.getWorldTransform()
        const worldScale = transform.getScale()
        // this.boundingBoxEntity.worldTransform.set(transform)
        this.boundingBoxEntity.setLocalScale(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z)
        const translation = transform.getTranslation()
        const angler = transform.getEulerAngles()
        this.boundingBoxEntity.setPosition(translation.x, translation.y, translation.z)
        this.boundingBoxEntity.setEulerAngles(angler)
        this.entity.addChild(this.boundingBoxEntity)
    }

    private calculateAvatarCollisionAndRigidbody = () => {
        if (this._entity.collision === undefined) {
            this._entity.addComponent('collision', {
                type: 'capsule',
                height: 1.84,
                radius: 0.35,
                // type: 'box',
                // halfExtents: aabb.halfExtents,
            })
        }
        if (this._entity.rigidbody === undefined) {
            this._entity.addComponent('rigidbody', {
                // type: BODYTYPE_DYNAMIC, // should be kinematic ?
                type: BODYTYPE_STATIC, // for demo statiuc
            })
        }
        if (this._entity.collision) {
            this._entity.collision.enabled = true
        }

        // let meshInstances: MeshInstance[] = []
        // const renders = this._entity.findComponents('render')
        // renders.forEach((render) => {
        //     if (render instanceof RenderComponent) {
        //         meshInstances.forEach((meshInstance) => {
        //             const entity = meshInstance.node as Entity

        //             if (!entity.render) return
        //             const asset = this.app.assets.get(entity.render.asset)
        //             if (entity.collision === undefined) {
        //                 entity.addComponent('collision', {
        //                     type: 'mesh',
        //                     renderAsset: asset,
        //                 })
        //             }
        //             if (entity.rigidbody === undefined) {
        //                 entity.addComponent('rigidbody', {
        //                     type: BODYTYPE_STATIC,
        //                 })
        //             }
        //         })
        //         meshInstances = meshInstances.concat(render.meshInstances)
        //     }
        // })
    }

    public replaceAvatar(avatarInfo: AvatarInfo): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                this._loadGlbContainerFromUrl(avatarInfo.model, {}, avatarInfo.id, (error: any, assetc: any) => {
                    this._avatarInfo = avatarInfo
                    setApplication(this.app)
                    this.app.scene.layers.getLayerByName('OutlineLayer_selectedObject')?.clearMeshInstances()
                    this.app.scene.layers.getLayerByName('OutlineLayer_hoveredObject')?.clearMeshInstances()
                    this._model = assetc.resource?.instantiateModelEntity()
                    if (!this._model) return reject('Cant instantiate model entity')
                    if (!(this._model instanceof Entity)) return reject('Cant instantiate model entity')
                    this._model.tags.add('avatar')
                    this._model.name = avatarInfo.id
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this._model.children.forEach((child: any) => {
                        if (!(child instanceof Entity)) return
                        child.tags.add('avatar_element')
                    })

                    const transform = this._entity.getWorldTransform()
                    const worldScale = transform.getScale()
                    // this._model.worldTransform.set(transform)
                    this._model.setLocalScale(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z)
                    this._cleanEntityChildren(this._entity)
                    this._entity.render?.hide()
                    // this._entity.model?.hide()
                    this._entity.removeComponent('collision')
                    this._entity.removeComponent('rigidbody')
                    // this._entity.removeComponent('model')
                    // this._entity.removeComponent('animation')
                    // this._entity.removeComponent('model')
                    const animationlist = Array.from(this.animationManager.animations.values())
                    this._model.addComponent('animation', {
                        assets: animationlist,
                        activate: true,
                        loop: true,
                        speed: 0, //when 1 is autostart
                        currentTime: 0,
                    })
                    this._entity.addChild(this._model)
                    //TO CHANGE ????
                    const addTagToAvatarElements = (m: any) => {
                        m.children.forEach((child: any) => {
                            addTagToAvatarElements(child)
                        })
                        m.tags.add('avatar_element')
                    }
                    addTagToAvatarElements(this._model)
                    this.calculateAvatarCollisionAndRigidbody()
                    resolve(true)
                })
            } catch (err) {
                this._avatarInfo = null
                this.reset()
                reject(err)
            }
        })
    }

    public playAnimation(animationName: string) {
        if (!this._model) return
        if (!this._model.animation) return
        this._model.animation.play(animationName, 0.2)
        this._model.animation.loop = true
        this._model.animation.speed = 1
    }

    public stopAnimations() {
        if (!this._model) return
        if (!this._model.animation) return
        this._model.animation.speed = 0
        this._model.animation.currentTime = 0
    }
    public reset() {
        this._cleanEntityChildren(this._entity)
        this._entity.render?.show()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _loadGlbContainerFromUrl(url: string, options: any, assetName: string, callback: (error: any, asset: any) => void) {
        const filename = assetName + '.glb'

        let modelUrl = url
        if (url?.includes('static') && !url?.includes('http')) {
            modelUrl = appConfig().STATIC_URL + url
        }
        const file = {
            url: modelUrl,
            filename: 'a' + filename,
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
        asset.on('error', (err) => {
            if (callback) {
                callback(err, null)
            }
        })

        this.app.assets.add(asset)
        this.app.assets.load(asset)

        return asset
    }

    private _cleanEntityChildren(entity: Entity) {
        entity.children?.forEach((child) => {
            if (child instanceof Entity) {
                if (child.rigidbody) child.removeComponent('rigidbody')
                if (child.collision) child.removeComponent('collision')
                if (child.model) child.removeComponent('model')
                if (child.render) child.removeComponent('render')
            }
            if (child.children.length > 0) {
                this._cleanEntityChildren(child as Entity)
            }
            // child.destroy()
            entity.removeChild(child)
        })
    }
}
