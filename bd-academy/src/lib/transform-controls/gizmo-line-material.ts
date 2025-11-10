// gizmomaterial function return class witchi extends standard material in playcanvas
// https://github.com/rollup/three-jsnext/blob/master/examples/js/controls/TransformControls.js#L9

import { Color } from 'playcanvas'
import GizmoMaterial from './gizmo-material'

export default class GizmoLineMaterial extends GizmoMaterial {
    public linewidth: number
    public linecap: string = 'round'
    public linejoin: string = 'round'
    public oldColor: Color = new Color(1, 1, 1, 1)
    public map: any
    public oldOpacity: number = 1
    constructor(parameters: any) {
        super(parameters)

        this.linewidth = 1
        this.linecap = 'round'
        this.linejoin = 'round'
        this.map = null
        this.copy = this._copy as any
    }

    public _copy(source: GizmoLineMaterial) {
        super.copy(source)
        this.color.copy(source.color)
        this.map = source.map
        this.linewidth = source.linewidth
        this.linecap = source.linecap
        this.linejoin = source.linejoin
        // this.fog = source.fog;
        return this
    }
}
