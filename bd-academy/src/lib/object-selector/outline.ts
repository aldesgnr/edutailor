import { Application, Color, Entity, PostEffect, ScriptType, Texture } from 'playcanvas'
import { OutlineEffect } from './posteffect-outline'

export class Outline extends ScriptType {
    public _lineColor = new Color(0.5, 0.5, 0.5)
    public _lineThickness = 1.0
    public _texture
    public effect: PostEffect | undefined
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        this.app = args.app
        this.entity = args.entity
        this._texture = new Texture(this.app.graphicsDevice)
    }

    get texture() {
        return this._texture
    }
    get lineColor() {
        return this._lineColor
    }
    set texture(texture: Texture) {
        this._texture = texture
        if (this.effect) {
            ;(this.effect as any).texture = this._texture ? this._texture : null
            // this.effect.texture =  this._texture ?  this._texture.resource : null
        }
    }
    set lineColor(lineColor: Color) {
        this._lineColor = lineColor
        if (this.effect) {
            ;(this.effect as any).color = this._lineColor
        }
    }

    public initialize = () => {
        if (!this.entity || !this.entity.camera) return
        this.effect = new OutlineEffect({
            graphicsDevice: this.app.graphicsDevice,
            thickness: this._lineThickness,
        })
    }
}
