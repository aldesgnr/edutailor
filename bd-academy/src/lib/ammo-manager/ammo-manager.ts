import { appConfig } from '../../app.config'

export default class AmmoManager {
    constructor() {}

    public loadAmmo() {
        return new Promise<void>((resolve) => {
            if (this.wasmSupported()) {
                this.loadWasmModuleAsync(
                    'Ammo',
                    appConfig().BASE_URL + '/static/lib/ammo/ammo.wasm.js',
                    appConfig().BASE_URL + '/static/lib/ammo/ammo.wasm.wasm',
                    () => {
                        resolve()
                    },
                )
            } else {
                this.loadWasmModuleAsync('Ammo', appConfig().BASE_URL + '/static/lib/ammo/ammo.js', '', () => {
                    resolve()
                })
            }
        })
    }

    private loadWasmModuleAsync(moduleName: string, jsUrl: string, binaryUrl: string, doneCallback: any) {
        const script = document.querySelector(`#module_${moduleName}`)

        if (script) {
            script.addEventListener('load', () => {
                ;(window as any)[moduleName].ready.then(() => {
                    doneCallback()
                })
            })
            return
        }
        this.loadScriptAsync(moduleName, jsUrl, () => {
            const lib = (window as any)[moduleName]
            ;(window as any)[`${moduleName}Lib`] = lib

            lib({
                locateFile() {
                    return binaryUrl
                },
            }).then((instance: any) => {
                ;(window as any)[moduleName] = instance

                doneCallback()
            })
        })
    }

    private loadScriptAsync(moduleName: string, url: string, doneCallback: any) {
        const tag = document.createElement('script')

        tag.onload = function () {
            doneCallback()
        }

        tag.onerror = function () {
            throw new Error(`failed to load ${url}`)
        }

        tag.async = true
        tag.id = 'module_' + moduleName

        tag.src = url

        document.head.appendChild(tag)
    }
    public wasmSupported() {
        try {
            if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))

                if (module instanceof WebAssembly.Module) return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
            }
        } catch (e) {}

        return false
    }
}
