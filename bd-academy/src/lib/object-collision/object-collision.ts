import {
    Application,
    CollisionComponent,
    Color,
    ContactResult,
    Entity,
    HandleEventCallback,
    MeshInstance,
    ScriptType,
    StandardMaterial,
    Vec3,
    createBox,
} from 'playcanvas'
import { BehaviorSubject } from 'rxjs'

export class ObjectCollision extends ScriptType {
    private _collisionComponents: CollisionComponent[] = []
    private _selectedObject: Entity | null = null
    private functions = new Map<string, HandleEventCallback>()
    private _selectedObjectCollisions = new Map<string, ContactResult>()
    public collisionsOfSelectedObject = new BehaviorSubject<ContactResult[]>([])
    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        this.app = args.app
        this.entity = args.entity
    }

    get entities() {
        return this._collisionComponents
    }
    set selectedObject(selectedObject: Entity | null) {
        this.collisionsOfSelectedObject.next([])
        if (selectedObject?.tags.has('replaceable')) {
            this._selectedObject = selectedObject
            this.enable(true)
        } else {
            this.enable(false)
        }
    }
    set collisionComponents(collisionComponents: CollisionComponent[]) {
        this._collisionComponents = collisionComponents
    }
    get collisionComponents() {
        return this._collisionComponents
    }

    public initialize = () => {
        this.addEvents()
        this.addOnDestroy()
    }

    private addEvents() {
        this.app.on('objectSelector:selected', this.onObjectSelected)
    }
    private addOnDestroy() {
        this.app.on('destroy', () => {
            this.app.off('objectSelector:selected', this.onObjectSelected)
        })
    }

    private onObjectSelected = (selectedObject: Entity | null) => {
        this.selectedObject = selectedObject
    }

    enable(state: boolean) {
        this.enabled = state
        //diabled
        if (state) {
            this.addCollisionEvents()
        } else {
            this.removeCollisionEvents()
        }
    }

    removeCollisionEvents() {
        this._collisionComponents.forEach((collisionComponent) => {
            const onTriggerCollisionStart = this.functions.get(collisionComponent.entity.getGuid() + '_onTriggerCollisionStart')
            if (!onTriggerCollisionStart) return
            collisionComponent.entity.collision?.off('collisionstart', onTriggerCollisionStart, this)

            const onTriggerCollisionEnd = this.functions.get(collisionComponent.entity.getGuid() + '_onTriggerCollisionEnd')
            if (!onTriggerCollisionEnd) return
            collisionComponent.entity.collision?.off('collisionend', onTriggerCollisionEnd, this)
            // collisionComponent.entity.collision?.on('triggerenter', this.onTriggerEnter, this)
            // collisionComponent.entity.collision?.on('triggerleave', this.onTriggerLeave, this)
            // collisionComponent.entity.collision?.off('contact', this.onContact, this)
        })
    }
    addCollisionEvents() {
        this._collisionComponents.forEach((collisionComponent) => {
            if (collisionComponent.entity.getGuid() !== this._selectedObject?.getGuid()) return
            const onTriggerCollisionStart = (contact: ContactResult) => {
                if (!contact.other) return
                if (this.isGizmo(contact.other)) return
                if (contact.other.tags.has('gizmo')) return
                const entity = collisionComponent.entity
                const collisionWith = contact.other
                const collisionPoints = contact.contacts
                this._selectedObjectCollisions.set(collisionWith.getGuid(), contact)
                this.collisionsOfSelectedObject.next(Array.from(this._selectedObjectCollisions.values()))
            }
            collisionComponent.entity.collision?.on('collisionstart', onTriggerCollisionStart, this)
            const onTriggerCollisionEnd = (collisionWithEnd: Entity) => {
                if (collisionWithEnd.tags.has('gizmo')) return
                this._selectedObjectCollisions.delete(collisionWithEnd.getGuid())
                this.collisionsOfSelectedObject.next(Array.from(this._selectedObjectCollisions.values()))
            }
            this.functions.set(collisionComponent.entity.getGuid() + 'onTriggerCollisionEnd', onTriggerCollisionEnd)
            collisionComponent.entity.collision?.on('collisionend', onTriggerCollisionEnd, this)
            // collisionComponent.entity.collision?.on('collisionend', this.onTriggerCollisionEnd, this)
            // collisionComponent.entity.collision?.on('triggerenter', this.onTriggerEnter, this)
            // collisionComponent.entity.collision?.on('triggerleave', this.onTriggerLeave, this)
            // collisionComponent.entity.collision?.on('contact', this.onContact, this)
        })
    }

    public createContactPoint = (point: Vec3, name: string) => {
        const testPoint = this.app.root.findByName(name)
        if (testPoint) testPoint.destroy()

        if (point) {
            const boxEntity = new Entity()
            boxEntity.name = name
            const box = createBox(this.app.graphicsDevice, {
                halfExtents: new Vec3(0.05, 0.05, 0.05),
                widthSegments: 1,
                lengthSegments: 1,
                heightSegments: 1,
            })
            const boxMat = new StandardMaterial()
            boxMat.diffuse = new Color(1, 0, 0, 1)
            boxEntity.addComponent('render', {
                meshInstances: [new MeshInstance(box, boxMat)],
            })
            this.app.root.addChild(boxEntity)
            boxEntity.setPosition(point)
        }
    }

    isGizmo = (entity: Entity) => {
        if (entity.tags.has('gizmo') || entity.tags.has('gizmo_plane')) return true
        return false
    }
}
