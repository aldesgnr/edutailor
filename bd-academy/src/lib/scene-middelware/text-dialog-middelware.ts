import { BehaviorSubject, Subject } from 'rxjs'

export default class TextDialogMiddelware {
    dom = document.createElement('div') as HTMLDivElement
    observ = new Map<string, Subject<any>>()
    dialogPlaying = new BehaviorSubject<boolean>(false)
    private _dialogspeed = 2

    constructor() {
        this.createContainer()

        this.dialogPlaying.subscribe((playing) => {
            if (playing) {
                this.dom.style.opacity = '0.2'
                this.dom.style.pointerEvents = 'none'
            } else {
                this.dom.style.opacity = '1'
                this.dom.style.pointerEvents = 'auto'
            }
        })
    }
    /**
     * @param speed in milliseconds [0-10]
     */
    set dialogspeed(speed: number) {
        this._dialogspeed = speed
    }
    get dialogspeed() {
        return this._dialogspeed
    }

    clearDialogs() {
        this.dom.childNodes.forEach((child) => {
            this.dom.removeChild(child)
        })
    }

    addDialog(statementDef: any, statementControlIndex: string) {
        const dialog = document.createElement('div') as HTMLDivElement
        dialog.id = 'dialog_' + statementDef.name
        dialog.style.minHeight = '20px'
        dialog.style.color = 'black'
        dialog.textContent = statementDef.value
        dialog.style.cursor = 'pointer'
        dialog.style.border = '1px solid black'
        dialog.onclick = () => this.onDialogSelected(statementDef, statementControlIndex)
        this.dom.appendChild(dialog)
        const sub = new Subject()
        this.observ.set(statementControlIndex, sub)

        return sub
    }

    onDialogSelected(statementDef: any, statementControlIndex: string) {
        this.dom.childNodes.forEach((child: any) => {
            if (child.id !== 'dialog_' + statementDef.name) this.dom.removeChild(child)
        })
        this.playDialog(statementDef.value).then((_) => {
            const obs = this.observ.get(statementControlIndex)
            obs?.next(statementDef)
            this.dialogPlaying.next(false)
        })
    }
    playDialog(text: string) {
        return new Promise((resolve) => {
            const msg = new SpeechSynthesisUtterance()
            msg.rate = this._dialogspeed
            msg.text = text
            window.speechSynthesis.speak(msg)
            this.dialogPlaying.next(true)
            msg.onend = () => {
                resolve(true)
            }
            msg.onerror = () => {
                resolve(true)
            }
        })
    }
    createContainer() {
        this.dom.id = 'dialogVisualizer'
        this.dom.style.width = '100%'
        this.dom.style.height = '80%'
        this.dom.style.position = 'absolute'
        this.dom.style.bottom = '0px'
        this.dom.style.background = 'white'
        this.dom.style.color = 'black'
    }
}
