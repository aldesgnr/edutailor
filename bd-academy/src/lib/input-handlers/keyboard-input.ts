import { Application, EVENT_KEYDOWN, EVENT_KEYUP, Entity, ScriptType } from 'playcanvas'

export class KeyboardInput extends ScriptType {
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
        if (!this.entity.script) throw new Error('entity script is not defined')
    }

    public initialize = () => {
        this.addEvents()

        this.on('destroy', () => {
            this.removeEvents()
        })
    }
    private addEvents = () => {
        this.app.keyboard.on(EVENT_KEYDOWN, this.onKeyDown, this)
        this.app.keyboard.on(EVENT_KEYUP, this.onKeyUp, this)
    }
    private removeEvents = () => {
        this.app.keyboard.off(EVENT_KEYDOWN, this.onKeyDown, this)
        this.app.keyboard.off(EVENT_KEYUP, this.onKeyUp, this)
    }

    public onKeyDown = (event: any) => {}

    public onKeyUp = (event: any) => {}
}
