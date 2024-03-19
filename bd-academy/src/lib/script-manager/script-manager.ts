import { AppBase, Application, Color, registerScript } from 'playcanvas'
import { TransformControls } from '../transform-controls/transform-controls'
import CameraManager from '../camera-manager/camera-manager'
import { BoundingBoxHelper, ObjectSelector } from '../object-selector'
import { ObjectOutlineHelper } from '../object-selector/object-outline-helper'
import { ObjectCollision } from '../object-collision/object-collision'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'
import EditorGrid from '../scene-manager/editor-grid'

export class ScriptManager {
    private app: Application | AppBase
    private _transformControls: TransformControls | undefined
    private _editorGrid: EditorGrid | undefined
    private _objectCollision: ObjectCollision | undefined
    private _hoveredObjectOutlineHelper: ObjectOutlineHelper | undefined
    private _selectedObjectOutlineHelper: ObjectOutlineHelper | undefined
    private _boundingBoxHelper: BoundingBoxHelper | undefined
    private _objectSelector: ObjectSelector | undefined
    public updates: Array<Function> = []
    constructor(
        app: Application | AppBase,
        private cameraManager: CameraManager,
    ) {
        this.app = app
    }
    get transformControls() {
        return this._transformControls
    }
    get objectCollision() {
        return this._objectCollision
    }

    get hoveredObjectOutlineHelper() {
        return this._hoveredObjectOutlineHelper
    }

    get selectedObjectOutlineHelper() {
        return this._selectedObjectOutlineHelper
    }
    get boundingBoxHelper() {
        return this._boundingBoxHelper
    }
    get objectSelector() {
        return this._objectSelector
    }

    public addTransformControlsSupport() {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        const script = this.app.scripts.get('TransformControls')
        if (!script) registerScript(TransformControls, 'TransformControls', this.app)
        const transformControls = this.cameraManager.editorCamera?.script.create(TransformControls, {
            attributes: {
                app: this.app,
                domElement: this.app.graphicsDevice.canvas,
            },
            enabled: true,
        })
        if (transformControls instanceof TransformControls) {
            this._transformControls = transformControls
        }
    }
    public addGridSupport() {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        const script = this.app.scripts.get('EditorGrid')
        if (!script) registerScript(EditorGrid, 'EditorGrid', this.app)

        const editorGrid = this.cameraManager.editorCamera?.script.create(EditorGrid, {
            attributes: {
                app: this.app,
                domElement: this.app.graphicsDevice.canvas,
            },
            enabled: true,
        })
        if (editorGrid instanceof EditorGrid) {
            this._editorGrid = editorGrid
        }
    }

    public addObjectSelectorSupport() {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        this.cameraManager.editorCamera.script.destroy('ObjectSelector')
        const script = this.app.scripts.get('ObjectSelector')
        if (!script) registerScript(ObjectSelector, 'ObjectSelector', this.app)
        this.cameraManager.editorCamera.addComponent('script')
        const objectSelector = this.cameraManager.editorCamera?.script.create(ObjectSelector, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
        if (objectSelector instanceof ObjectSelector) {
            this._objectSelector = objectSelector
        }
    }

    public addObjectSelectorBoundingBoxHelper = () => {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        const script = this.app.scripts.get('BoundingBoxHelper')
        if (!script) registerScript(BoundingBoxHelper, 'BoundingBoxHelper', this.app)
        const boundingBoxHelper = this.cameraManager.editorCamera?.script.create(BoundingBoxHelper, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
        if (boundingBoxHelper instanceof BoundingBoxHelper) {
            this._boundingBoxHelper = boundingBoxHelper
            this.updates.push(this._boundingBoxHelper.update.bind(this._boundingBoxHelper))
        }
    }

    public addSelectedObjectOutlineHelper = () => {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        this.cameraManager.editorCamera.script.destroy('ObjectOutlineHelper_selected')
        const script = this.app.scripts.get('ObjectOutlineHelper_selected')
        if (!script) registerScript(ObjectOutlineHelper, 'ObjectOutlineHelper_selected', this.app)
        const selectedObjectOutlineHelper = this.cameraManager.editorCamera?.script.create('ObjectOutlineHelper_selected', {
            attributes: {
                app: this.app,
                name: 'selectedObject',
                color: new Color(0, 0.5, 1, 1),
                objectSelectionEvents: ['objectSelector:selected'],
            },
            enabled: true,
        })
        if (selectedObjectOutlineHelper instanceof ObjectOutlineHelper) {
            this._selectedObjectOutlineHelper = selectedObjectOutlineHelper
            this.updates.push(this._selectedObjectOutlineHelper.update.bind(this._selectedObjectOutlineHelper))
        }
    }
    public addHoveredObjectOutlineHelper = () => {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        this.cameraManager.editorCamera.script.destroy('ObjectOutlineHelper_hovered')
        const script = this.app.scripts.get('ObjectOutlineHelper_hovered')
        if (!script) registerScript(ObjectOutlineHelper, 'ObjectOutlineHelper_hovered', this.app)
        const hoveredObjectOutlineHelper = this.cameraManager.editorCamera?.script.create('ObjectOutlineHelper_hovered', {
            attributes: {
                app: this.app,
                name: 'hoveredObject',
                color: new Color(0, 1, 1, 1),
                objectSelectionEvents: ['objectSelector:hovered'],
            },
            enabled: true,
        })

        if (hoveredObjectOutlineHelper instanceof ObjectOutlineHelper) {
            this._hoveredObjectOutlineHelper = hoveredObjectOutlineHelper
            this.updates.push(this._hoveredObjectOutlineHelper.update.bind(this._hoveredObjectOutlineHelper))
        }
    }

    public addObjectCollisionHelper = () => {
        if (!this.cameraManager.editorCamera?.script) return
        setApplication(this.app)
        const script = this.app.scripts.get('ObjectCollision')
        if (!script) registerScript(ObjectCollision, 'ObjectCollision', this.app)
        const objectCollision = this.cameraManager.editorCamera?.script.create(ObjectCollision, {
            attributes: {
                app: this.app,
            },
            enabled: true,
        })
        if (objectCollision instanceof ObjectCollision) {
            this._objectCollision = objectCollision
        }
    }
}
