import {
    AnimationHandler,
    AppBase,
    Application,
    JsonHandler,
    MaterialHandler,
    ModelHandler,
    RenderHandler,
    SceneHandler,
    ScriptHandler,
    TextureHandler,
} from 'playcanvas'

// import { SceneParser } from 'playcanvas/build/playcanvas.dbg.mjs/framework/parsers/scene'
export default class LoaderHandleManager {
    constructor(private _app: Application | AppBase) {}
    init() {
        const sceneHandler = new SceneHandler(this._app)
        this._app.loader.addHandler('scene', sceneHandler)
        const renderHandler = new RenderHandler(this._app)
        this._app.loader.addHandler('render', renderHandler)
        const scriptHandler = new ScriptHandler(this._app)
        this._app.loader.addHandler('script', scriptHandler)
        const jsonHandler = new JsonHandler(this._app)
        this._app.loader.addHandler('json', jsonHandler)
        const modelHandler = new ModelHandler(this._app)
        this._app.loader.addHandler('model', modelHandler)
        const textureHandler = new TextureHandler(this._app)
        this._app.loader.addHandler('texture', textureHandler)
        const materialHandler = new MaterialHandler(this._app)
        this._app.loader.addHandler('material', materialHandler)
        const animationHandler = new AnimationHandler(this._app)
        this._app.loader.addHandler('animation', animationHandler)
    }
}

// export class SceneHandlerMod extends SceneHandler {
//     constructor(app: Application | AppBase) {
//         super(app)
//     }

//     open(url, data) {
//         // prevent script initialization until entire scene is open
//         const parser = new SceneParser(this._app, false)
//         const parent = parser.parse(data)
//         console.log(parent)
//         // set scene root
//         const scene = this._app.scene
//         scene.root = parent
//         this._app.applySceneSettings(data.settings)

//         return scene
//     }
//     // open(url: string, data: any) {
//     //     console.log(this._app)
//     //     this._app.systems.script.preloading = true
//     //     const parser = new SceneParser(this._app, false)
//     //     const parent = parser.parse(data)
//     //     return {} as Scene
//     //     //   SceneUtils.load(url, this.maxRetries, callback);
//     // }
// }
