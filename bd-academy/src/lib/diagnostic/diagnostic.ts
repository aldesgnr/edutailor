export default class Diagnostic {
    private lastCalledTime: number = 0
    private _fps: number = 0
    private delta: number = 0
    private _domElement: HTMLElement | null = null
    private _enabled: boolean = false
    constructor() {
        document.querySelector('#diagnosticWrapper')?.remove()
        this._domElement = document.createElement('div')
        this._domElement.id = 'diagnosticWrapper'
        this._domElement.style.position = 'absolute'
        this._domElement.style.left = '0px'
        this._domElement.style.bottom = '0px'
        this._domElement.style.height = '20px'
        this._domElement.style.width = '100px'
        this._domElement.style.background = 'red'
        this._domElement.style.zIndex = '1500000'
        this._domElement.style.display = this._enabled ? 'block' : 'none'
    }
    get fps() {
        return this._fps
    }
    get domElement() {
        return this._domElement
    }
    set enabled(state: boolean) {
        this._enabled = state
        if (this._domElement) {
            this._domElement.style.display = this._enabled ? 'block' : 'none'
        }
    }

    public tick(dt: number) {
        if (this._enabled === false) return
        // if (!this.lastCalledTime) {
        //     this.lastCalledTime = dt
        //     this._fps = 0
        //     return
        // }
        this.delta = dt
        this._fps = 1 / this.delta
        if (this._domElement) {
            this._domElement.innerText = `FPS: ${this.fps.toFixed(0)}`
        }
    }
}
