import { AppBase, Application, Entity, EVENT_KEYDOWN, KEY_ESCAPE, XRSPACE_LOCALFLOOR, XRSPACE_VIEWER, XRTYPE_VR, XrManager } from 'playcanvas'
import { BehaviorSubject } from 'rxjs'
import CameraManager from '../camera-manager/camera-manager'
import { setApplication } from 'playcanvas/build/playcanvas.mjs/framework/globals'

export default class WebXrManager {
    private app: Application | AppBase
    public xrManager: XrManager | null = null
    private _vrCamera: Entity | null = null
    private xrType: string = XRTYPE_VR
    public vrAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public vrActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    public vrSupported: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private cameraManager: CameraManager
    constructor(app: Application | AppBase, cameraManager: CameraManager) {
        this.app = app
        this.cameraManager = cameraManager
    }
    set vrCamera(camera: Entity | null) {
        this._vrCamera = camera
    }
    get vrCamera() {
        return this._vrCamera
    }

    init() {
        setApplication(this.app)
        this.xrManager = this.app.xr
        this.cameraManager.createVrCamera()
        this._vrCamera = this.cameraManager.vrCamera

        this.addEvents()
        this.addOnDestroy()
        // const supp = this.isSupported()
        // const act = this.isActive()
        // const ava = this.isAvailable()
        // console.log('WEBXR MANAGER INIT', {
        //     supported: supp,
        //     active: act,
        //     available: ava,
        // })
    }

    start() {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) return reject('not supported')
            if (!this._vrCamera) return reject('no vr camera')
            if (!this._vrCamera?.camera) return reject('no vr camera component')
            this.cameraManager.setCamera('vrCamera')
            this._vrCamera.camera.startXr(this.xrType, XRSPACE_LOCALFLOOR, {
                callback: (err) => {
                    if (err) {
                        this.cameraManager.setCamera(this.cameraManager.lastActiveCamera)
                        reject('xr failed')
                    } else {
                        resolve(true)
                    }
                },
            })
        })
    }
    end() {
        if (!this.app.xr.active) return
        this.app.xr.end()
    }

    private addEvents() {
        this.app.keyboard.on(EVENT_KEYDOWN, this.onKeyDownEndVR, this)
        this.xrManager?.on('available:' + this.xrType, this.onAvailableChange, this)
        this.xrManager?.on('start', this.onStartVRSession, this)
        this.xrManager?.on('end', this.onEndVRSessions, this)
        this.xrManager?.on(
            'error',
            (err) => {
                console.log(err)
            },
            this,
        )
        // when controller is added
        this.xrManager?.input.on(
            'add',
            function (inputSource) {
                // clone controller entity template
                console.log('inputSource', inputSource)
                // var entity = this.controllerTemplate.resource.instantiate();

                // // find related model asset
                // var asset = null;
                // for(var i = 0; i < inputSource.profiles.length; i++) {
                //     var name = inputSource.profiles[i] + '-' + inputSource.handedness;
                //     asset = this.controllerAssetsIndex[name];
                //     if (asset) break;
                // }

                // // default to generic-trigger
                // if (! asset) asset = this.controllerAssetsIndex['generic-trigger-' + (inputSource.handedness || 'none')];
                // entity.reparent(this.app.root);
                // entity.script.controller.setInputSource(inputSource, asset);
                // entity.enabled = true;
            },
            this,
        )
    }
    private onEndVRSessions() {
        this.cameraManager.setCamera('firstPersonCamera')
        this.vrActive.next(false)
    }
    private onStartVRSession() {
        this.vrActive.next(true)
    }
    private onAvailableChange(available: boolean) {
        this.vrAvailable.next(available)
    }
    private addOnDestroy() {
        this.app.on('destroy', () => {
            this.app.keyboard.off(EVENT_KEYDOWN, this.onKeyDownEndVR, this)
            this.xrManager?.off('available:' + this.xrType, this.onAvailableChange, this)
            this.xrManager?.off('start', this.onStartVRSession, this)
            this.xrManager?.off('end', this.onEndVRSessions, this)
        })
    }

    private onKeyDownEndVR(evt: any) {
        if (evt.key === KEY_ESCAPE) {
            //brakuje ustaiwnie kamery do pierwotnej
            this.end()
        }
    }

    public isActive() {
        this.vrActive.next(this.app.xr.active)
        return this.app.xr.active
    }
    public isAvailable() {
        const available = this.app.xr.isAvailable(this.xrType)
        this.vrAvailable.next(available)
        return available
    }
    public isSupported() {
        this.vrSupported.next(this.app.xr.supported)
        return this.app.xr.supported
    }
}
