// gizmomaterial function return class witchi extends standard material in playcanvas
// https://github.com/rollup/three-jsnext/blob/master/examples/js/controls/TransformControls.js#L9

import { BLENDEQUATION_ADD, BLENDMODE_ONE_MINUS_SRC_ALPHA, BLENDMODE_SRC_ALPHA, BasicMaterial, BlendState, Color } from 'playcanvas'

export const GIZMO_RED = new Color(1, 0, 0, 0.9)
export const GIZMO_GREEN = new Color(0, 1, 0, 0.9)
export const GIZMO_BLUE = new Color(0, 0, 1, 0.9)
export interface GizmoMaterialParameters {
    name?: string
    diffuse?: Color
    opacity?: number
}
export default class GizmoMaterial extends BasicMaterial {
    public oldColor: Color
    public oldOpacity: number = 0.9
    constructor(parameters?: GizmoMaterialParameters) {
        super()

        this.color = new Color(0.5, 0.5, 0.5, 0.9)
        this.depthTest = false
        this.depthWrite = false
        if (parameters?.opacity !== undefined) {
            this.color.a = parameters.opacity
        }
        if (this.color.a !== 1) {
            this.blendState = new BlendState(true, BLENDEQUATION_ADD, BLENDMODE_SRC_ALPHA, BLENDMODE_ONE_MINUS_SRC_ALPHA)
        }

        this.oldColor = this.color.clone()
        this.oldOpacity = this.color.clone().a
        this.update()
    }

    public changeColor = (color: Color) => {
        this.oldColor = this.color.clone()
        this.color.copy(color)
        this.update()
    }

    public highlight = (highlighted: boolean) => {
        if (highlighted) {
            this.color.a = 0.5
        } else {
            this.color.a = this.oldOpacity
        }
        this.update()
    }
}
