import { Application, Entity, ScriptType, Vec3 } from 'playcanvas'

export class FirstPersonCharacterController extends ScriptType {
    public entity: Entity
    public app
    private speed = 5
    private jumpImpulse = 400
    private groundCheckRay: Vec3 = new Vec3()
    private rayEnd: Vec3 = new Vec3()
    private groundNormal: Vec3 = new Vec3()
    private onGround = false
    private jumping = false

    constructor(args: { app: Application; entity: Entity }) {
        super(args)
        if (!args.app) throw new Error('app is not defined')
        this.app = args.app
        if (!args.entity) throw new Error('entity is not defined')
        this.entity = args.entity
    }

    public initialize(): void {
        this.groundCheckRay = new Vec3(0, -1.2, 0)
        this.rayEnd = new Vec3()

        this.groundNormal = new Vec3()
        this.onGround = true
        this.jumping = false
    }
    move(direction: Vec3) {
        if (this.onGround && !this.jumping) {
            var tmp = new Vec3()

            var length = direction.length()
            if (length > 0) {
                // calculate new forward vec parallel to the current ground surface
                tmp.cross(this.groundNormal, direction).cross(tmp, this.groundNormal)
                tmp.normalize().mulScalar(length * this.speed)
            }
            if (!this.entity.rigidbody) throw new Error('rigidbody is not defined')
            this.entity.rigidbody.linearVelocity = tmp
        }
    }
    jump() {
        if (this.onGround && !this.jumping) {
            if (!this.entity.rigidbody) throw new Error('rigidbody is not defined')
            this.entity.rigidbody.applyImpulse(0, this.jumpImpulse, 0)
            this.onGround = false
            this.jumping = true
            setTimeout(() => {
                this.jumping = false
            }, 500)
        }
    }

    public reset() {
        //TODO
    }

    public update = (dt: number) => {
        if (!this.entity.enabled) return
        var pos = this.entity.getPosition()
        this.rayEnd.add2(pos, this.groundCheckRay)

        if (!this.app.systems.rigidbody) throw new Error('rigidbody is not defined')
        // Fire a ray straight down to just below the bottom of the rigid body,
        // if it hits something then the character is standing on something.
        var result = this.app.systems.rigidbody.raycastFirst(pos, this.rayEnd)
        this.onGround = !!result
        if (result) {
            this.groundNormal.copy(result.normal)
        }
    }
}
