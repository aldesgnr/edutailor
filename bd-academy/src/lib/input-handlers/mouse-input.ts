import { Application, EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, EVENT_MOUSEWHEEL, Entity, ScriptType } from 'playcanvas'
export class MouseInput extends ScriptType {
    public app: Application
    public entity: Entity
    // public enabled = true
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')

        this.app.on('camera:orbit:disable', () => {
            this.enabled = false
        })
        this.app.on('camera:orbit:enable', () => {
            this.enabled = true
        })
    }

    public initialize = () => {
        this.app.mouse.disableContextMenu()

        this.addEvents()

        this.on('destroy', () => {
            this.removeEvents()
        })
    }

    private addEvents = () => {
        this.app.mouse.on(EVENT_MOUSEDOWN, this.onMouseDown, this)
        this.app.mouse.on(EVENT_MOUSEUP, this.onMouseUp, this)
        this.app.mouse.on(EVENT_MOUSEMOVE, this.onMouseMove, this)
        this.app.mouse.on(EVENT_MOUSEWHEEL, this.onMouseWheel, this)

        // this.app.mouse.on(EVENT_TOUCHSTART, this.onMouseDown, this)
        // this.app.mouse.on(EVENT_TOUCHEND, this.onMouseUp, this)
        // this.app.mouse.on(EVENT_TOUCHMOVE, this.onMouseMove, this)

        // Listen to when the mouse travels out of the window
        // window.addEventListener('mouseout', onMouseOut, false)
        window.addEventListener('mouseout', this.onMouseOut, false)
    }

    // Remove the listeners so if this entity is destroyed
    private removeEvents = () => {
        this.app.mouse.off(EVENT_MOUSEDOWN, this.onMouseDown, this)
        this.app.mouse.off(EVENT_MOUSEUP, this.onMouseUp, this)
        this.app.mouse.off(EVENT_MOUSEMOVE, this.onMouseMove, this)
        this.app.mouse.off(EVENT_MOUSEWHEEL, this.onMouseWheel, this)

        // this.app.mouse.off(EVENT_TOUCHSTART, this.onMouseDown, this)
        // this.app.mouse.off(EVENT_TOUCHEND, this.onMouseUp, this)
        // this.app.mouse.off(EVENT_TOUCHMOVE, this.onMouseMove, this)

        // window.removeEventListener('mouseout', onMouseOut, false)
        window.addEventListener('mouseout', this.onMouseOut, false)
    }

    public onMouseDown = (event: any) => {}
    public onMouseUp = (event: any) => {}
    public onMouseMove = (event: any) => {}
    public onMouseWheel = (event: any) => {}
    public onMouseOut = (event: any) => {}
}
