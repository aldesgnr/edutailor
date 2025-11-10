// outline model based on example https://playcanvas.github.io/#/graphics/model-outline
import {
    Application,
    Color,
    Entity,
    FILTER_LINEAR,
    Layer,
    MeshInstance,
    ModelComponent,
    PIXELFORMAT_RGBA8,
    RenderComponent,
    RenderTarget,
    ScriptType,
    Texture,
    Vec3,
    registerScript,
} from 'playcanvas'
import { Outline } from './outline'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'

export class ObjectOutlineHelper extends ScriptType {
    private _outlineObjectEntity: Entity | null = null
    private renderTarget: RenderTarget | undefined
    private renderTexture: Texture | undefined
    private outlineLayer: Layer | undefined
    private _outline: Outline | undefined
    private outlineCamera: Entity | undefined
    private _meshInstaces: MeshInstance[] = []
    private _color = new Color(1, 0, 0, 1)
    private _name = 'ObjectOutlineHelper'
    private _objectSelectionEvents: string[] = ['objectSelector:selected']
    private _scriptName = 'Outline'

    constructor(args: { app: Application; entity: Entity; attributes?: { [key: string]: any } }) {
        super(args)
        this.app = args.app
        this.entity = args.entity
        if (args.attributes) {
            if (args.attributes.color !== undefined) this._color.copy(args.attributes.color)
            if (args.attributes.name !== undefined) this._name = args.attributes.name
            if (args.attributes.objectSelectionEvents !== undefined) this._objectSelectionEvents = args.attributes.objectSelectionEvents
        }

        this._scriptName = this._scriptName + '_' + this._name

        this.app.graphicsDevice.on('resizecanvas', this.onWindowResize, this)
    }

    private _crateOutlineEffect = () => {
        if (!this.entity || !this.entity.script) return
        this.entity.script.destroy(this._scriptName)
        const script = this.app.scripts.get(this._scriptName)
        if (!script) registerScript(Outline, this._scriptName, this.app)
        const outline = this.entity.script.create(this._scriptName, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
        if (outline instanceof Outline) {
            this._outline = outline
            outline.lineColor = this._color
            if (this.renderTarget) {
                outline.texture = this.renderTarget.colorBuffer
            }
            if (this.entity.camera && this._outline.effect) {
                this.entity.camera.postEffects.addEffect(this._outline.effect as any) // default its posteffect, but there is wrang ttypuings
            }
        }
    }
    private _crateOutlineCamera = () => {
        this.outlineCamera = new Entity('outlineCamera_' + this._name)
        this.outlineCamera.addComponent('camera', {
            clearColor: new Color(0.0, 0.0, 0.0, 0.0),
            layers: [this.outlineLayer?.id],
            renderTarget: this.renderTarget,
        })
        this._checkAspectRatio()
        this.app.root.addChild(this.outlineCamera)
        console.log(this.outlineCamera)
    }
    private _crateOutlineLayer = () => {
        setApplication(this.app)
        const layerExist = this.app.scene.layers.getLayerByName(`OutlineLayer_${this._name}`)
        if (!layerExist) {
            this.outlineLayer = new Layer({
                name: `OutlineLayer_${this._name}`,
            })
            // this.outlineLayer.renderTarget = this.renderTarget
            this.app.scene.layers.insert(this.outlineLayer, 0)
        } else {
            this.outlineLayer = layerExist
        }
    }

    private _createRenderTarget = () => {
        setApplication(this.app)
        this.renderTexture = new Texture(this.app.graphicsDevice, {
            name: `OutlineObjects_${this._name}`,
            width: this.app.graphicsDevice.width,
            height: this.app.graphicsDevice.height,
            format: PIXELFORMAT_RGBA8,
            mipmaps: false,
            minFilter: FILTER_LINEAR,
            magFilter: FILTER_LINEAR,
        })
        this.renderTarget = new RenderTarget({
            colorBuffer: this.renderTexture,
            depth: true,
        })
    }

    set outlineObjectEntity(outlineObjectEntity: Entity | null) {
        if (outlineObjectEntity?.tags.has('picker') || outlineObjectEntity?.tags.has('gizmo') || outlineObjectEntity?.tags.has('plane')) {
            this._outlineObjectEntity = null
        } else {
            this._outlineObjectEntity = outlineObjectEntity
        }

        this.addMeshInstances()
    }

    private addMeshInstances = () => {
        if (!this.outlineLayer) return
        this.outlineLayer.clearMeshInstances()
        this._meshInstaces = []
        if (this._outlineObjectEntity) {
            let meshInstaces: MeshInstance[] = []
            const mmi = this._outlineObjectEntity.findComponents('model').map((model) => {
                if (model instanceof ModelComponent) {
                    if (model.meshInstances?.length > 0) {
                        return model.meshInstances
                    }
                }
                return []
            })
            meshInstaces = [...meshInstaces, ...mmi.flat()]
            const rmi = this._outlineObjectEntity.findComponents('render').map((render) => {
                if (render instanceof RenderComponent) {
                    if (render.meshInstances.length > 0) {
                        return render.meshInstances
                    }
                }
                return []
            })
            meshInstaces = [...meshInstaces, ...rmi.flat()]

            if (meshInstaces.length > 0) {
                this._meshInstaces = meshInstaces.flat()
                this.outlineLayer.addMeshInstances(this._meshInstaces)
            }
        }
        this.app.scene.layers.getLayerByName('Wolrd')?.clearMeshInstances()
    }

    public cameraPositionChanged = (cameraPosition?: Vec3) => {
        this.addMeshInstances()
    }
    public initialize = () => {
        this._crateOutlineLayer()
        this._createRenderTarget()
        this._crateOutlineCamera()
        this._crateOutlineEffect()
        if (this.outlineCamera) {
            this.app.root.addChild(this.outlineCamera)
            if (this.entity.camera) {
                this.outlineCamera.setLocalPosition(this.entity.getLocalPosition())
                this.outlineCamera.setLocalRotation(this.entity.getLocalRotation())
            }
        }
        this.addEvents()
        this.addOnDestroy()
    }

    private addEvents() {
        this._objectSelectionEvents.forEach((objectSelectionEvent: string) => {
            this.app.on(objectSelectionEvent, this.onOutlineObject)
        })
    }

    private addOnDestroy() {
        this.on('destroy', () => {
            if (this.outlineLayer) {
                this.app.scene.layers.remove(this.outlineLayer)
            }
            if (this.outlineCamera) {
                this.outlineCamera.destroy()
            }
            if (this.renderTarget) {
                this.renderTarget.destroy()
            }
            if (this.renderTexture) {
                this.renderTexture.destroy()
            }
            if (this.entity.camera) {
                this.entity.camera.postEffects.removeEffect(this._outline?.effect as any)
            }

            this._objectSelectionEvents.forEach((objectSelectionEvent: string) => this.app.off(objectSelectionEvent, this.onOutlineObject))
        })
    }

    private onOutlineObject = (outlineObjectEntity: Entity | null) => {
        this.outlineObjectEntity = outlineObjectEntity
    }

    public onWindowResize = () => {
        // re-create the render target for the outline camera
        if (this.renderTarget) {
            this.renderTarget.colorBuffer.destroy()
            this.renderTarget.destroy()
        }
        this._createRenderTarget()
        this._checkAspectRatio()

        if (this.outlineCamera && this.outlineCamera.camera && this.renderTarget && this._outline) {
            this.outlineCamera.camera.renderTarget = this.renderTarget
            this._outline.texture = this.renderTarget.colorBuffer
        }
    }

    private _checkAspectRatio = () => {
        if (!this.outlineCamera || !this.outlineCamera.camera) return
        const height = this.app.graphicsDevice.canvas.offsetHeight
        const width = this.app.graphicsDevice.canvas.offsetWidth
        this.outlineCamera.camera.horizontalFov = height > width
        this.cameraPositionChanged()
    }
    public postInitialize = () => {}

    public checkCameraParamsChanged = () => {
        if (!this.outlineCamera || !this.outlineCamera.camera) return
        if (this.entity.camera && this.outlineCamera.camera) {
            if (this.entity.camera.fov !== this.outlineCamera.camera.fov) {
                this.outlineCamera.camera.fov = this.entity.camera.fov
            }
            if (this.entity.camera.nearClip !== this.outlineCamera.camera.nearClip) {
                this.outlineCamera.camera.nearClip = this.entity.camera.nearClip
            }
            if (this.entity.camera.farClip !== this.outlineCamera.camera.farClip) {
                this.outlineCamera.camera.farClip = this.entity.camera.farClip
            }
        }
        this.outlineCamera.setPosition(this.entity.getPosition())
        this.outlineCamera.setRotation(this.entity.getRotation())
        this.outlineCamera.setLocalPosition(this.entity.getLocalPosition())
        this.outlineCamera.setLocalRotation(this.entity.getLocalRotation())
    }
    public update = (dt: number) => {
        this.checkCameraParamsChanged()
    }
}
