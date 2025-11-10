import {
    AppBase,
    Application,
    BLEND_NONE,
    BoundingBox,
    CameraComponent,
    Color,
    Entity,
    GraphNode,
    MeshInstance,
    ScreenComponent,
    StandardMaterial,
    Vec3,
    Vec4,
    createBox,
    createCone,
} from 'playcanvas'

export function traverse(object: Entity | GraphNode, callback: (object: Entity | GraphNode) => void) {
    const visited = new Map<string, boolean>()
    object.children.forEach((child, childIndex) => {
        if (child instanceof Entity) {
            const visitedKey = child.getGuid()
            if (visited.get(visitedKey) === undefined) {
                if (child.render) {
                    callback(child)
                    visited.set(visitedKey, true)
                }
                if (child.children.length > 0) {
                    traverse(child, callback)
                }
            }
            visited.set(child.getGuid(), true)
        } else if (child instanceof GraphNode) {
            const visitedKey = `${child.name}_${childIndex}`
            if (visited.get(visitedKey) === undefined) {
                if (child.children.length > 0) {
                    traverse(child, callback)
                }
            }
            visited.set(visitedKey, true)
        }
    })
    callback(object)
}
export function traverseUpwards(object: Entity | GraphNode, callback: (object: Entity | GraphNode) => void) {
    const visited = new Map<string, boolean>()
    if (object.parent) {
        const visitedKey = `${object.parent.name}`

        if (visited.get(visitedKey) === undefined) {
            callback(object.parent)
            visited.set(visitedKey, true)
        }
    }

    callback(object)
}

export function getPersonEntity(entity: Entity | GraphNode): Entity | null {
    if (!entity) return null
    if (entity.name === 'mainScene') return null
    if (entity.tags.has('person')) {
        return entity as Entity
    } else {
        return getPersonEntity(entity.parent as Entity)
    }
}
export function destroyEntity(entity: Entity) {
    if (entity) {
        if (entity.model) {
            entity.removeComponent('model')
        }
        if (entity.render) {
            entity.removeComponent('render')
        }
        if (entity.rigidbody) {
            entity.removeComponent('rigidbody')
        }
        if (entity.collision) {
            entity.removeComponent('collision')
        }

        // Destroy the entity
        entity.destroy()
    }
}

export function createCameraBox(app: AppBase | Application) {
    const cameraBoxEntity = new Entity('cameraBoxEntity')
    const boxEntity = new Entity('cameraBox')
    const coneEntity = new Entity('cameraCone')
    cameraBoxEntity.tags.add("camera")
    boxEntity.tags.add("camera")
    coneEntity.tags.add("camera")
    boxEntity.name = 'cameraBox'
    const box = createBox(app.graphicsDevice, {
        halfExtents: new Vec3(0.1, 0.2, 0.2),
        widthSegments: 1,
        lengthSegments: 1,
        heightSegments: 1,
    })
    const cone = createCone(app.graphicsDevice, {
        baseRadius: 0.1,
        peakRadius: 0,
        height: 0.2,
        heightSegments: 1,
        capSegments: 12,
    })
    const boxMat = new StandardMaterial()
    const coneMat = new StandardMaterial()
    // boxMat.depthTest = false
    // boxMat.depthWrite = false

    // boxMat.blendType = BLEND_NONE
    boxMat.opacity = 0.5
    coneMat.opacity = 0.5

    boxMat.diffuse = new Color(1, 0, 0, 1)
    coneMat.diffuse = new Color(1, 0, 0, 1)
    boxEntity.addComponent('render', {
        meshInstances: [new MeshInstance(box, boxMat)],
    })

    coneEntity.addComponent('render', {
        meshInstances: [new MeshInstance(cone, coneMat)],
    })
    coneEntity.setLocalPosition(0, 0, -0.3)
    coneEntity.setEulerAngles(90, 0, 0)
    cameraBoxEntity.addChild(boxEntity)
    cameraBoxEntity.addChild(coneEntity)

    return cameraBoxEntity
}

/**
 * Converts a coordinate in world space into a screen's space.
 *
 * @param {Vec3} worldPosition - the Vec3 representing the world-space coordinate.
 * @param {CameraComponent} camera - the Camera.
 * @param {ScreenComponent} screen - the Screen
 * @returns {Vec3} a Vec3 of the input worldPosition relative to the camera and screen. The Z coordinate represents the depth,
 * and negative numbers signal that the worldPosition is behind the camera.
 */
export function worldToScreenSpace(app: Application | AppBase, worldPosition: Vec3, camera: CameraComponent, screen: ScreenComponent) {
    const screenPos = camera.worldToScreen(worldPosition)
    // take pixel ratio into account
    const pixelRatio = app.graphicsDevice.maxPixelRatio
    screenPos.x *= pixelRatio
    screenPos.y *= pixelRatio

    // account for screen scaling
    const scale = screen.scale

    // invert the y position
    screenPos.y = screen.resolution.y - screenPos.y

    // put that into a Vec3
    return new Vec3(screenPos.x / scale, screenPos.y / scale, screenPos.z / scale)
}
export function createCollisionBB(app: AppBase | Application, entity: Entity) {
    const boxEntity = new Entity()
    boxEntity.name = 'colissionBB' + entity.getGuid()
    // const aabb = new BoundingBox()
    //         if (entity.render) {
    //             entity.render.meshInstances.forEach((meshInstance) => {
    //                 aabb.add(meshInstance.aabb)
    //             })
    //         }
    let halfExtents = entity.render?.meshInstances[0]?.aabb.halfExtents || new Vec3(1, 1, 1)
    if (entity.collision) {
        if (entity.collision.type === 'box') {
            halfExtents = entity.collision.halfExtents
        }
        if (entity.collision.type === 'capsule') {
            halfExtents = new Vec3(entity.collision.radius, entity.collision.height / 2, entity.collision.radius)
        }
    }
    const box = createBox(app.graphicsDevice, {
        halfExtents: halfExtents,
        widthSegments: 1,
        lengthSegments: 1,
        heightSegments: 1,
    })
    const boxMat = new StandardMaterial()
    // boxMat.depthTest = false
    // boxMat.depthWrite = false

    boxMat.blendType = BLEND_NONE
    boxMat.opacity = 0.2

    boxMat.diffuse = new Color(0, 1, 0, 1)
    boxEntity.addComponent('render', {
        meshInstances: [new MeshInstance(box, boxMat)],
    })
    return boxEntity
}

export function createTestBox(app: AppBase | Application, halfExtents: Vec3 = new Vec3(20, 0.1, 20)) {
    const boxEntity = new Entity()
    boxEntity.name = 'testbox'
    const box = createBox(app.graphicsDevice, {
        halfExtents: halfExtents,
        widthSegments: 1,
        lengthSegments: 1,
        heightSegments: 1,
    })
    const boxMat = new StandardMaterial()
    // boxMat.depthTest = false
    // boxMat.depthWrite = false

    boxMat.blendType = BLEND_NONE
    boxMat.opacity = 0.5

    boxMat.diffuse = new Color(1, 0, 0, 1)
    boxEntity.addComponent('render', {
        meshInstances: [new MeshInstance(box, boxMat)],
    })
    // boxEntity.addComponent('collision', {
    //     type: 'box',
    //     halfExtents: halfExtents,
    // })
    // boxEntity.addComponent('rigidbody', {
    //     type: 'static',
    // })
    return boxEntity
}

export function colorToArr(color: Color): [number, number, number] {
    return [color.r, color.g, color.b]
}
export function colorToRGBAArr(color: Color): [number, number, number, number] {
    return [color.r, color.g, color.b, color.a]
}
export function vec3toArr(vec3: Vec3): [number, number, number] {
    return [vec3.x, vec3.y, vec3.z]
}

export function vec4toArr(vec4: Vec4): [number, number, number, number] {
    return [vec4.x, vec4.y, vec4.z, vec4.w]
}
