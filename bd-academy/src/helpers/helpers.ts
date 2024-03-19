import { string } from 'playcanvas'

export function loadScriptAsync(scriptUrl: string, doneCallback: any) {
    const tag = document.createElement('script')

    tag.onload = function (script) {
        doneCallback()
    }

    tag.onerror = function () {
        throw new Error(`failed to load ${scriptUrl}`)
    }

    tag.async = true

    tag.src = scriptUrl

    document.head.appendChild(tag)
}
