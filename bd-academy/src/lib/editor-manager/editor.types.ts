export interface TrainingScene {
    baseInfo: {
        uuid: string
        title: string
        description: string
        locale: string
    }
    training: {
        scene: JSONSceneExport
        avatars: JSONAvatarsExport
    }
}
export interface JSONLayer {
    name: string
    enabled: boolean
    opaqueSortMode: number
    transparentSortMode: number
    id: number
}
export interface JSONAvatarsExport {
    [key: string]: {
        avatarInfo: AvatarInfo | null
        entity: string
    }
}
export interface JSONSceneExport {
    created_at: string
    name: string
    settings: {
        physics: {
            gravity: [number, number, number]
        }
        layers: JSONLayer[]
        layerOrder: number[]
        render: {
            exposure: number
            fog: string
            fog_color: [number, number, number]
            fog_destiny: number
            fog_end: number
            fog_start: number
            gamma_correction: number
            global_ambient: [number, number, number]
            lightmapMaxResolution: number
            lightmapMode: number
            lightmapSizeMultiplier: number
            skybox: any
            skyboxIntensity: number
            skyboxMip: number
            tonemapping: number
            skyboxRotation: [number, number, number]
            clusteredLightingEnabled: null
        }
    }
    entities: Record<string, JSONEntity>
    assets: Record<number, any>
    materialAssets: Record<number, any>
}

export interface JSONEntity {
    name: string
    tags: []
    labels: []
    enabled: true
    resource_id: string
    parent: string | null
    children: [string]
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
    components: {
        render: {
            enabled: boolean
            type: string
            asset: string | number
            materialAssets: string[] | number[]
            layers: number[]
            batchGroupId: null
            castShadows: boolean
            castShadowsLightmap: boolean
            receiveShadows: boolean
            lightmapped: boolean
            lightmapSizeMultiplier: number
            castShadowsLightMap: boolean
            lightMapped: boolean
            lightMapSizeMultiplier: number
            isStatic: boolean
            rootBone: null
        }
        script: {
            enabled: boolean
            order: ['position']
            scripts: {
                position: {
                    enabled: boolean
                    attributes: {
                        lastdt: number
                    }
                }
            }
        }
        camera: {}
        collision: {}
        rigidbody: {}
    }
}
export interface Scene {
    id: string
    name: string
    model: string
    description: string
    image: string
    avatars: string[]
    previewSceneTraining: string
}
export interface Configuration {
    id: string
    scenes: Scene[]
    fonts: FontInfo[]
    avatars: AvatarInfo[]
    assets: AssetInfo[]
    animations: AnimationInfo[]
}
export interface AvatarInfo {
    id: string
    name?: string
    type?: string
    gender: string
    image: string
    model: string
}
export interface FontInfo {
    id: string
    name: string
    url: string
}
export interface AnimationInfo {
    id: string
    name: string
    url: string
}
export interface AssetInfo {
    id: string
    model: string
}
