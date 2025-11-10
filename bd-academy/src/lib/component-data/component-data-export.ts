import { RenderComponent } from 'playcanvas'

export default class RenderComponentExport {
    private exportKeys = [
        'enabled',
        'type',
        'asset',
        'materialAssets',
        'layers',
        'batchGroupId',
        'castShadows',
        'castShadowsLightmap',
        'receiveShadows',
        'lightmapped',
        'lightmapSizeMultiplier',
        'isStatic',
        'rootBone',
    ]
    public object = {}
    constructor(private component: RenderComponent) {
        this.exportKeys.forEach((key) => {
            Object.assign(this.object, { [key]: this.component[key as keyof RenderComponent] })
        })
    }
}
