import { NodeDef } from '../scenarion-engine/types'

export default class SceneMiddelware {
    constructor() {}

    playDialog(nodeDef: NodeDef) {
        console.log(nodeDef)
    }
}
