// transform controls for playcanvas based on threejs tansform controls, but with some changes to make it work with playcanvas
// https://github.com/rollup/three-jsnext/blob/master/examples/js/controls/TransformControls.js

import {
    Application,
    Color,
    EVENT_MOUSEDOWN,
    EVENT_MOUSEMOVE,
    EVENT_MOUSEUP,
    EVENT_MOUSEWHEEL,
    EVENT_TOUCHCANCEL,
    EVENT_TOUCHEND,
    EVENT_TOUCHMOVE,
    EVENT_TOUCHSTART,
    Entity,
    MOUSEBUTTON_LEFT,
    MeshInstance,
    Plane,
    Quat,
    Ray,
    ScriptType,
    StandardMaterial,
    Vec2,
    Vec3,
    createBox,
} from 'playcanvas'
import GizmoMaterial from './gizmo-material'
import { GIZMO_AXIS, GIZMO_PLANES } from './transform-gizmo'
import TransformGizmoRotate from './transform-gizmo-rotate'
import TransformGizmoScale from './transform-gizmo-scale'
import TransformGizmoTranslate from './transform-gizmo-translate'

export enum TransofrmControlModes {
    TRANSLATE = 'translate',
    ROTATE = 'rotate',
    SCALAE = 'scale',
}

export class TransformControls extends ScriptType {
    private _mode: TransofrmControlModes = TransofrmControlModes.TRANSLATE
    private _dragging: boolean = false
    private _plane = 'XY'
    private planeIntersectPoint = new Vec3() // old point
    private _pointer = new Vec3()
    private offsetStartPoint = new Vec3()
    private oldPosition = new Vec3()
    private oldScale = new Vec3()
    private oldRotation = new Quat()
    private worldPosition = new Vec3()
    private worldRotation = new Quat()
    private camPosition = new Vec3()
    private eye = new Vec3()
    private camRotation = new Quat()

    private transformControls = new Entity()

    private _gizmo: {
        [TransofrmControlModes.TRANSLATE]: TransformGizmoTranslate
        [TransofrmControlModes.ROTATE]: TransformGizmoRotate
        [TransofrmControlModes.SCALAE]: TransformGizmoScale
    }
    private _selectedObject: Entity | null = null
    private visible: boolean = false
    private _translationSnap: boolean = false
    private _rotationSnap: boolean = false
    private _space: string = 'world'
    private _size: number = 1
    private _position: Vec3 = new Vec3(0, 0, 0)
    private _scale: Vec3 = new Vec3(1, 1, 1)
    private axis: GIZMO_AXIS | GIZMO_PLANES | null = null
    private domElement: HTMLElement | Document = document
    private highlihtedMaterials: GizmoMaterial[] = []
    // private pickerMaterial: GizmoMaterial = new GizmoMaterial({ diffuse: new Color(1, 1, 1, 1), name: 'pickerMaterial' })

    constructor(args: { app: Application; entity: Entity; attributes: any }) {
        super(args)
        this.app = args.app
        this.entity = args.entity
        this.domElement = args.attributes.domElement !== undefined ? args.attributes.domElement : document
        this._gizmo = {
            translate: new TransformGizmoTranslate(args),
            rotate: new TransformGizmoRotate(args),
            scale: new TransformGizmoScale(args),
        }
    }

    get mode() {
        return this._mode
    }
    get translationSnap() {
        return this._translationSnap
    }
    get rotationSnap() {
        return this._rotationSnap
    }
    get space() {
        return this._space
    }
    get size() {
        return this._size
    }

    set size(size: number) {
        this._size = size
        this.update()
        this.fire('change')
    }

    set space(space: string) {
        this._space = space
        this.update()
        this.fire('change')
    }
    set translationSnap(translationSnap: boolean) {
        this._translationSnap = translationSnap
    }
    set rotationSnap(rotationSnap: boolean) {
        this._rotationSnap = rotationSnap
    }
    set mode(mode: TransofrmControlModes) {
        this._mode = mode ? mode : this._mode

        if (this._mode === 'scale') this.space = 'local'

        Object.values(this._gizmo).forEach((gizmo) => {
            // gizmo.visible = false
            gizmo.visible = gizmo.type === this._mode
        })
        this.setGizmoVisible()
        // for ( var type in this._gizmo ) this._gizmo[ type ].visible = ( type === this._mode );

        this.update()
        this.fire('change')
    }
    set selectedObject(selectedObject: Entity | null) {
        if (!selectedObject || selectedObject?.tags.has('picker') || selectedObject?.tags.has('gizmo') || selectedObject?.tags.has('plane')) {
            this.detach()
        } else {
            this.attach(selectedObject)
        }

        this.update()
    }

    public initialize = () => {
        this.transformControls.name = 'transformControls'

        Object.values(this._gizmo).forEach((gizmo) => {
            this.transformControls.addChild(gizmo.gizmo)
        })

        const mainScene = this.app.root.findByName('mainScene')
        if (mainScene) {
            mainScene.addChild(this.transformControls)
        }

        this.camRotation.setFromEulerAngles(0, 0, 0)
        this.worldRotation.setFromEulerAngles(0, 0, 0)

        this.setGizmoVisible()
        this.addEvents()
        this.addOnDestroy()
    }

    private addEvents() {
        this.app.on('objectSelector:selected', this.onObjectSelected)

        // this.app.mouse.on(EVENT_MOUSEDOWN, this.onMouseDown, this)
        this.app.mouse.on(EVENT_MOUSEDOWN, this.onPointerDown, this)
        this.app.touch.on(EVENT_TOUCHSTART, this.onPointerDown, this)

        this.app.mouse.on(EVENT_MOUSEMOVE, this.onPointerHover, this)
        this.app.touch.on(EVENT_TOUCHMOVE, this.onPointerHover, this)

        this.app.mouse.on(EVENT_MOUSEMOVE, this.onPointerMove, this)
        this.app.touch.on(EVENT_TOUCHMOVE, this.onPointerMove, this)

        this.app.mouse.on(EVENT_MOUSEUP, this.onPointerUp, this)
        this.domElement.addEventListener('mouseout', this.onPointerUp, false)
        this.app.touch.on(EVENT_TOUCHEND, this.onPointerUp, this)
        this.app.touch.on(EVENT_TOUCHCANCEL, this.onPointerUp, this)

        this.app.mouse.on(EVENT_MOUSEWHEEL, this.onMouseWheel, this)
    }
    private addOnDestroy() {
        this.app.on('destroy', () => {
            this.app.off('objectSelector:selected', this.onObjectSelected)
            this.app.mouse.off(EVENT_MOUSEDOWN, this.onPointerDown, this)
            this.app.touch.off(EVENT_TOUCHSTART, this.onPointerDown, this)

            this.app.mouse.off(EVENT_MOUSEMOVE, this.onPointerHover, this)
            this.app.touch.off(EVENT_TOUCHMOVE, this.onPointerHover, this)

            this.app.mouse.off(EVENT_MOUSEMOVE, this.onPointerMove, this)
            this.app.touch.off(EVENT_TOUCHMOVE, this.onPointerMove, this)

            this.app.mouse.off(EVENT_MOUSEUP, this.onPointerUp, this)
            this.domElement.addEventListener('mouseout', this.onPointerUp, false)
            this.app.touch.off(EVENT_TOUCHEND, this.onPointerUp, this)
            this.app.touch.off(EVENT_TOUCHCANCEL, this.onPointerUp, this)

            this.app.mouse.off(EVENT_MOUSEWHEEL, this.onMouseWheel, this)
        })
    }

    private onObjectSelected = (selectedObject: Entity | null) => {
        this.selectedObject = selectedObject
    }
    public update = () => {
        this.worldPosition = this.transformControls.getPosition().clone()
        this.worldRotation = this.transformControls.getRotation().clone()
        this.camPosition = this.entity.getPosition().clone()
        const scale = (this.worldPosition.distance(this.camPosition) / 6) * this.size
        this._position.copy(this.worldPosition)
        this._scale.set(scale, scale, scale)

        Object.values(this._gizmo).forEach((gizmo) => {
            gizmo.setGizmoContainerPosition()
            if (gizmo instanceof TransformGizmoScale && this._selectedObject) {
                gizmo.setGizmoContainerRotation(this._selectedObject.getRotation())
            }
        })
    }

    public attach = (selectedObject: Entity) => {
        this._selectedObject = selectedObject
        this.visible = true
        this.enabled = true
        Object.values(this._gizmo).forEach((gizmo) => {
            gizmo.selectedObject = selectedObject
        })
        this.setGizmoVisible()
        this.update()
    }
    public detach = () => {
        this._selectedObject = null
        this.visible = false
        this.enabled = false
        this.axis = null
        Object.values(this._gizmo).forEach((gizmo) => {
            gizmo.selectedObject = null
        })
        this.setGizmoVisible()
        this.update()
    }

    public onPointerUp = () => {
        this._dragging = false
        this.highlihtedMaterials.forEach((material) => {
            material.highlight(false)
        })
        this.highlihtedMaterials = []
        if (!this._selectedObject) return
        this.app.fire('camera:orbit:enable')
    }

    _updatePointer = (event: any) => {
        this._pointer.set(event.x, event.y, 0)
    }
    public onMouseWheel = () => {
        if (!this._selectedObject) return
        if (this.entity.getPosition().equals(this.camPosition)) return
        else {
            this.update()
        }
    }

    public onPointerMove = (e: any) => {
        if (this.mode === 'scale') {
            this.space = 'local'
        } else if (this.axis === ('E' as any) || this.axis === GIZMO_PLANES.XYZE || this.axis === GIZMO_PLANES.XYZ) {
            this.space = 'world'
        } else {
            this.space = 'world'
        }

        if (!this._selectedObject || this._dragging === false) return
        this._updatePointer(e)
        const pointer = new Vec2(e.event.offsetX, e.event.offsetY)
        this._gizmo[this._mode].setActivePlane(this.axis as GIZMO_AXIS, this.eye)
        const activePlane = this._gizmo[this._mode].activePlane
        if (activePlane) {
            const planeIntersect = this.intersectPointOnPlane(pointer, activePlane)
            if (!planeIntersect) return
            e.event.preventDefault()
            e.event.stopPropagation()

            this.planeIntersectPoint.copy(planeIntersect.point)
            if (!this.axis) return console.log('no axis')
            if (this._mode === 'translate') {
                if (this.space === 'local') {
                    // fix transalto on local
                }
                if (this.space === 'world' || this.axis.search('XYZ') !== -1) {
                    const differanceVector = new Vec3().copy(this.planeIntersectPoint).sub(this.offsetStartPoint)

                    if (this.axis.search('X') === -1) differanceVector.x = 0
                    if (this.axis.search('Y') === -1) differanceVector.y = 0
                    if (this.axis.search('Z') === -1) differanceVector.z = 0

                    const newPos = new Vec3().copy(this.oldPosition).add(differanceVector)
                    this._selectedObject.setPosition(newPos)
                }
            } else if (this._mode === 'scale') {
                const differanceVector = new Vec3().copy(this.planeIntersectPoint).sub(this.offsetStartPoint)
                const newScale = new Vec3().copy(this.oldScale)
                if (this.axis.indexOf('X') !== -1) newScale.mul(new Vec3(1 + differanceVector.x, 1, 1))
                if (this.axis.indexOf('Y') !== -1) newScale.mul(new Vec3(1, 1 + differanceVector.y, 1))
                if (this.axis.indexOf('Z') !== -1) newScale.mul(new Vec3(1, 1, 1 + differanceVector.z))

                if (newScale.x < 0) newScale.x = 0.001
                if (newScale.y < 0) newScale.y = 0.001
                if (newScale.z < 0) newScale.z = 0.001

                if (newScale) this._selectedObject.setLocalScale(newScale)
            } else if (this._mode === 'rotate') {
                let axis = new Vec3(1, 0, 0)
                let endAngle = 0
                let startAngle = 0
                if (this.axis === 'X') {
                    axis = new Vec3(1, 0, 0)
                    endAngle = Math.atan2(this.planeIntersectPoint.z, this.planeIntersectPoint.y) / (Math.PI / 180)
                    startAngle = Math.atan2(this.offsetStartPoint.z, this.offsetStartPoint.y) / (Math.PI / 180)
                } else if (this.axis === 'Y') {
                    axis = new Vec3(0, 1, 0)
                    endAngle = Math.atan2(this.planeIntersectPoint.x, this.planeIntersectPoint.z) / (Math.PI / 180)
                    startAngle = Math.atan2(this.offsetStartPoint.x, this.offsetStartPoint.z) / (Math.PI / 180)
                } else if (this.axis === 'Z') {
                    axis = new Vec3(0, 0, 1)
                    endAngle = Math.atan2(this.planeIntersectPoint.y, this.planeIntersectPoint.x) / (Math.PI / 180)
                    startAngle = Math.atan2(this.offsetStartPoint.y, this.offsetStartPoint.x) / (Math.PI / 180)
                }

                const angleDifference = endAngle - startAngle
                const quatDifference = new Quat().setFromAxisAngle(axis, angleDifference)
                const newRotation = this.oldRotation.clone()
                newRotation.mul(quatDifference)
                this._selectedObject.setRotation(newRotation)
                // this._updatePointer(pointer)
                // this.createPoint(this.planeIntersectPoint, 'planeIntersectPoint')
                // this.createPoint(this.offsetStartPoint, 'offsetStartPoint')
            }

            //apply transformation to object rigidbody to proper selection
            if (this._selectedObject.rigidbody) {
                const newRotation = this._selectedObject.getRotation().clone()
                const newPosition = this._selectedObject.getPosition().clone()
                this._selectedObject.rigidbody.teleport(newPosition, newRotation)
                this._selectedObject.rigidbody.linearVelocity = Vec3.ZERO
                this._selectedObject.rigidbody.angularVelocity = Vec3.ZERO
            }
        }
        this.update()
    }

    public onPointerDown = (e: any) => {
        if (!this._selectedObject || this._dragging === true || (e.event.button !== undefined && e.event.button !== MOUSEBUTTON_LEFT)) return
        this._updatePointer(e)

        const intersect = this.intersectObjects(new Vec2(this._pointer.x, this._pointer.y))
        if (intersect) {
            e.event.preventDefault()
            e.event.stopPropagation()
            const axis = intersect.name.split('_').at(-1)
            if (axis === undefined) this.axis = null
            else this.axis = axis as any
            this.update()

            this.eye.copy(this.camPosition).sub(this.worldPosition).normalize()
            this._gizmo[this._mode].setActivePlane(this.axis as GIZMO_AXIS, this.eye)
            const activePlane = this._gizmo[this._mode].activePlane
            if (activePlane) {
                const planeIntersect = this.intersectPointOnPlane(new Vec2(this._pointer.x, this._pointer.y), activePlane)
                if (planeIntersect) {
                    this.oldPosition.copy(this._selectedObject.getPosition().clone())
                    this.oldRotation.copy(this._selectedObject.getRotation().clone())
                    this.oldScale.copy(this._selectedObject.getLocalScale().clone())
                    this.offsetStartPoint.copy(planeIntersect.point)
                }
            }
            this.app.fire('camera:orbit:disable')
            this._dragging = true
        } else {
            this._dragging = false
        }

        return
    }

    public onPointerHover = (e: any) => {
        if (!this._selectedObject || this._dragging === true || (e.event.button !== undefined && e.event.button !== 0)) return
        const pointer = new Vec2(e.x, e.y)

        this.highlihtedMaterials.forEach((material) => {
            material.highlight(false)
        })
        this.highlihtedMaterials = []
        const intersect = this.intersectObjects(pointer)

        document.body.style.cursor = 'default'
        if (intersect) {
            document.body.style.cursor = 'pointer'
            let axis = intersect.name.split('_').at(-1)
            if (axis === undefined) this.axis = null
            else this.axis = axis as any
            // const parent = intersect.parent
            let intersectType = 'axis'
            if (intersect.tags.has('plane')) {
                intersectType = 'plane'
            } else {
                intersectType = 'axis'
            }

            this._gizmo[this._mode].handles.children.forEach((handleEntity) => {
                if (!(handleEntity instanceof Entity)) return
                if (!handleEntity.tags.has(this.axis)) return
                if (handleEntity.tags.has(intersectType)) {
                    if (handleEntity.render) {
                        handleEntity.render.meshInstances.forEach((meshInstance) => {
                            if (meshInstance.material && meshInstance.material instanceof GizmoMaterial) {
                                meshInstance.material.highlight(true)
                                this.highlihtedMaterials.push(meshInstance.material)
                            }
                        })
                    }
                    if (handleEntity.children.length > 0) {
                        handleEntity.children.forEach((child) => {
                            if (!(child instanceof Entity)) return
                            if (!child.render) return
                            child.render.meshInstances.forEach((meshInstance) => {
                                if (meshInstance.material && meshInstance.material instanceof GizmoMaterial) {
                                    meshInstance.material.highlight(true)
                                    this.highlihtedMaterials.push(meshInstance.material)
                                }
                            })
                        })
                    }
                }
            })
        }
    }
    // test this later, mayby will work better than raycastFirst
    public rayOnPlane = (pointOnScreen: Vec2, plane: Entity) => {
        if (!this.entity.camera) return false
        const intersectionPoint = new Vec3()
        //a normal to xz-plane: (0,1,0)
        // a normal to xy-plane: (0,0,1)
        // a normal to yz-plane: (1,0,0)
        const to = this.entity.camera.screenToWorld(pointOnScreen.x, pointOnScreen.y, this.entity.camera.farClip)
        const xz = new Vec3(0, 1, 0)
        const xy = new Vec3(0, 0, 1)
        const yz = new Vec3(1, 0, 0)
        this.entity.lookAt(to)
        const forward = this.entity.forward.clone()
        // this.entity.lookAt(new Vec3())
        const rayStartPoint = this.entity.camera.screenToWorld(pointOnScreen.x, pointOnScreen.y, this.entity.camera.nearClip)
        const ray = new Ray(rayStartPoint, forward)
        const planee = new Plane(xz, 0)
        planee.intersectsRay(ray, intersectionPoint)
        // this.createPoint(intersectionPoint)
        return intersectionPoint
    }

    public intersectPointOnPlane = (pointOnScreen: Vec2, plane: Entity) => {
        if (!this.entity.camera) return false
        if (!this.app.systems) return false
        if (!this.app.systems.rigidbody) return false
        const intersectionStartPoint = this.entity.camera.screenToWorld(pointOnScreen.x, pointOnScreen.y, this.entity.camera.nearClip) // new Vec3(0, 0, 0)
        const intersectionEndPoint = this.entity.camera.screenToWorld(pointOnScreen.x, pointOnScreen.y, this.entity.camera.farClip)

        const result = this.app.systems.rigidbody.raycastFirst(intersectionStartPoint, intersectionEndPoint, {
            filterCallback: (e: Entity) => {
                if (e.getGuid() === plane.getGuid()) {
                    return true
                }
                return false
            },
        })
        return result
    }

    public createPoint = (point: Vec3, name: string = 'testPoint') => {
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
    public intersectObjects = (point: Vec2) => {
        if (!this.entity.camera) return false
        if (!this.app.systems) return false
        if (!this.app.systems.rigidbody) return false
        const from = this.entity.getPosition()
        // const from = this.entity.camera.screenToWorld(screenX, screenY, this.entity.camera.nearClip) //new Vec3(0.13707251740218823, 10.523703072626944, 46.29009937476555) //
        const to = this.entity.camera.screenToWorld(point.x, point.y, this.entity.camera.farClip) // new Vec3(0, 0, 0)

        const result = this.app.systems.rigidbody.raycastFirst(from, to, {
            filterCallback: (e: Entity) => {
                if (e.render && e.tags.has('gizmo')) {
                    return true
                }
                return false
            },
        })
        return result ? result.entity : false
    }

    private setGizmoVisible = () => {
        Object.values(this._gizmo).forEach((gizmo) => {
            gizmo.visible = false
            if (this._mode === gizmo.type && this._selectedObject) {
                gizmo.visible = true
            }
        })
    }
}
