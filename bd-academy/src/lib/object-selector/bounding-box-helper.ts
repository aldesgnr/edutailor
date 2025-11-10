import { Application, BoundingBox, Color, Entity, MeshInstance, ScriptType, Vec3 } from 'playcanvas'

export class BoundingBoxHelper extends ScriptType {
    private _object: MeshInstance | null = null

    private _box: BoundingBox | null = null
    private _vertices = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()]

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        this.app = args.app
        this.entity = args.entity
    }

    set object(object: MeshInstance | null) {
        this._object = object
        if (object === null) {
            this._box = null
        } else {
            this._box = object.aabb
        }
    }

    public initialize = () => {}
    public postInitialize = () => {}

    public update = (dt: number) => {
        if (!this._box || !this._object) return
        this._box.center.copy(this._object.node.getPosition())
        // Render the box every frame
        this._renderBox(Color.RED)
    }
    private _renderBox = (color: Color) => {
        if (!this._box) return
        // Get the maximum and minimum points of the bounding box
        const max = this._box.getMax()
        const min = this._box.getMin()
        this._vertices[0].set(min.x, min.y, min.z)
        this._vertices[1].set(max.x, min.y, min.z)
        this._vertices[2].set(max.x, min.y, max.z)
        this._vertices[3].set(min.x, min.y, max.z)
        this._vertices[4].set(min.x, max.y, min.z)
        this._vertices[5].set(max.x, max.y, min.z)
        this._vertices[6].set(max.x, max.y, max.z)
        this._vertices[7].set(min.x, max.y, max.z)

        const v = this._vertices

        this.app.drawLine(v[0], v[1], color)
        this.app.drawLine(v[1], v[2], color)
        this.app.drawLine(v[2], v[3], color)
        this.app.drawLine(v[3], v[0], color)

        this.app.drawLine(v[4], v[5], color)
        this.app.drawLine(v[5], v[6], color)
        this.app.drawLine(v[6], v[7], color)
        this.app.drawLine(v[7], v[4], color)

        this.app.drawLine(v[0], v[4], color)
        this.app.drawLine(v[1], v[5], color)
        this.app.drawLine(v[2], v[6], color)
        this.app.drawLine(v[3], v[7], color)
    }
}
