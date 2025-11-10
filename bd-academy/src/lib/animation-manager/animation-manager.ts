import { AppBase, Application, Asset, AssetListLoader } from 'playcanvas'
import { appConfig } from '../../app.config'
import { AnimationInfo } from '../editor-manager/editor.types'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'

export default class AnimationManager {
    public animations = new Map<string, Asset>()
    private _animationDef: AnimationInfo[] = []
    constructor(private app: Application | AppBase) {}

    set animationsDef(animations: AnimationInfo[]) {
        this._animationDef = animations
        this._getAnimations()
    }
    _getAnimations() {
        const animationAsset: Asset[] = []
        this._animationDef.forEach((animation) => {
            const filename = animation.name

            let modelUrl = ''
            const url = animation.url
            if (url?.includes('static') && !url?.includes('http')) {
                modelUrl = appConfig().STATIC_URL + url
            }

            const file = {
                url: modelUrl,
                filename: filename,
            }
            const asset = new Asset(filename, 'animation', file, {})
            animationAsset.push(asset)
        })

        const _assetListLoader = new AssetListLoader(animationAsset, this.app.assets)
        setApplication(this.app)
        _assetListLoader.load(() => {
            this._animationDef.forEach((animation) => {
                const animationAsset = this.app.assets.find(animation.name)
                if (animationAsset) {
                    this.animations.set(animation.name, animationAsset)
                }
            })
        })
    }
}
