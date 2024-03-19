import {
    Application,
    EVENT_MOUSEDOWN,
    EVENT_MOUSEMOVE,
    EVENT_MOUSEUP,
    EVENT_TOUCHEND,
    Entity,
    GraphNode,
    Layer,
    MOUSEBUTTON_RIGHT,
    Picker,
    ScriptType,
} from 'playcanvas'
import { BehaviorSubject } from 'rxjs'
import { getPersonEntity } from '../utils/playcanvas-utils'

export class ObjectSelector extends ScriptType {
    public name: string = 'ObjectSelector'
    public mouseMoved: boolean = false
    public mouseDown: boolean = false
    public enable: boolean = true
    private picker: Picker
    private pickerLayers: Layer[] = []
    public app: Application
    public entity: Entity

    public selectedObject: BehaviorSubject<Entity | GraphNode | null> = new BehaviorSubject<Entity | GraphNode | null>(null)
    public hoveredObject: BehaviorSubject<Entity | GraphNode | null> = new BehaviorSubject<Entity | GraphNode | null>(null)

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.camera) throw new Error('camera is not defined')

        this.picker = new Picker(this.app, 1, 1)

        this.addLayerToPicker('World')
        this.picker.prepare(this.entity.camera, this.app.scene, this.pickerLayers)
    }

    public initialize = () => {
        this.addEvents()
        this.addOnDestroy()
    }
    public postInitialize = () => {
        this.postInitializePicker()
    }
    public postInitializePicker = () => {
        this.picker.resize(this.app.graphicsDevice.canvas.offsetWidth, this.app.graphicsDevice.canvas.offsetHeight)
        this.preparePicker()
    }
    private addLayerToPicker = (layerName: string) => {
        const layer = this.app.scene.layers.getLayerByName(layerName)
        if (layer === undefined) return console.log(layer, ' doesnt exists')
        if (layer) {
            const layerIDx = layer.id
            const existing = this.pickerLayers.find((layer) => layer.id === layerIDx)
            if (!existing) {
                this.pickerLayers.push(layer)
            }
        }
    }
    private addEvents = () => {
        this.app.graphicsDevice.on('resizecanvas', this.postInitializePicker, this)

        this.app.mouse.on(EVENT_MOUSEUP, this.onPointerUp, this)
        this.app.mouse.on(EVENT_MOUSEDOWN, this.onPointerDown, this)
        this.app.mouse.on(EVENT_MOUSEMOVE, this.onPointerMove, this)

        if (this.app.touch) {
            this.app.touch.on(EVENT_TOUCHEND, this.onTouchEnd, this)
        }
        window.addEventListener('mouseout', this.onMouseOut, false)

        this.app.on('editableScene:updated', this.preparePicker)
        // ten event cos nie trybi i psuje zaznaczenie
        this.app.on('editorCamera:position:updated', this.preparePicker)
    }

    private preparePicker = () => {
        if (!this.entity.camera) return
        this.picker.prepare(this.entity.camera, this.app.scene, this.pickerLayers)
    }

    public addOnDestroy = () => {
        this.on('destroy', () => {
            this.app.graphicsDevice.off('resizecanvas', this.postInitializePicker, this)

            this.app.mouse.off(EVENT_MOUSEUP, this.onPointerUp, this)
            this.app.mouse.off(EVENT_MOUSEMOVE, this.onPointerMove, this)

            if (this.app.touch) {
                this.app.touch.off(EVENT_TOUCHEND, this.onTouchEnd, this)
            }
            window.addEventListener('mouseout', this.onMouseOut, false)
            this.app.off('editableScene:updated', this.preparePicker)
            this.app.off('editorCamera:position:updated', this.preparePicker)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onPointerMove = (event: any) => {
        this.mouseMoved = true
        this.preparePicker()
        const hovered = this.picker.getSelection(event.x, event.y)
        let hoveredObject = null
        if (hovered == undefined || hovered.length === 0) hoveredObject = null
        if (hovered[0]?.node.tags.has('gizmo')) hoveredObject = null
        if (hovered[0]?.node instanceof Entity) {
            hoveredObject = hovered[0].node
        }
        if (hovered[0]?.node.tags.has('avatar_element')) {
            const p = getPersonEntity(hovered[0]?.node)
            if (p) {
                hoveredObject = p
            }
        }
        this.app.fire('objectSelector:hovered', hoveredObject)
        return this.hoveredObject.next(hoveredObject)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onPointerDown = (event: any) => {
        if (this.enabled === false || event.button === MOUSEBUTTON_RIGHT) return
        this.mouseDown = true
        this.mouseMoved = false
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onPointerUp = (event: any) => {
        if (this.enabled === false || event.button === MOUSEBUTTON_RIGHT) return
        if (this.mouseMoved) return
        /** Old code
            this.preparePicker()
            const picked = this.picker.getSelection(event.x, event.y)
            let selectedObject = null
            if (picked == undefined || picked.length === 0) selectedObject = null
            if (picked[0]?.node.tags.has('gizmo')) selectedObject = null
            if (picked[0]?.node instanceof Entity) {
                selectedObject = picked[0].node
            }
         */
        const selectedObject = this.hoveredObject.value
        this.hoveredObject.next(null)
        this.mouseDown = false
        this.mouseMoved = false
        this.app.fire('objectSelector:selected', selectedObject)
        this.app.fire('objectSelector:hovered', null)
        return this.selectedObject.next(selectedObject)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onTouchEnd = (event: any) => {
        if (event.touches.length === 1) {
            this.onPointerUp(event.touches[0])
            // this.doRaycast(event.touches[0].x, event.touches[0].y)
        }
        event.event.preventDefault()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onMouseOut = (event: any) => {
        this.mouseDown = false
        this.mouseMoved = false
    }
    private doRaycast = (screenX: number, screenY: number) => {
        if (!this.entity.camera) return
        if (!this.app.systems) return
        if (!this.app.systems.rigidbody) return
        const from = this.entity.getPosition()
        // const from = this.entity.camera.screenToWorld(screenX, screenY, this.entity.camera.nearClip) //new Vec3(0.13707251740218823, 10.523703072626944, 46.29009937476555) //
        const to = this.entity.camera.screenToWorld(screenX, screenY, this.entity.camera.farClip) // new Vec3(0, 0, 0)

        const result = this.app.systems.rigidbody.raycastFirst(from, to, {
            filterCallback: (e: Entity) => {
                if (e.render && !e.tags.has('gizmo')) {
                    return true
                }
                return false
            },
        })
        return result
    }
}
