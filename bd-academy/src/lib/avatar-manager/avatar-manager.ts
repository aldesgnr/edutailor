import { AppBase, Application, Entity } from 'playcanvas'
import Avatar from './avatar'
import AnimationManager from '../animation-manager/animation-manager'
import { JSONAvatarsExport } from '../editor-manager/editor.types'

export default class AvatarManager {
    private app: Application | AppBase
    public avatars = new Map<string, Avatar>()
    constructor(
        app: Application | AppBase,
        private animationManager: AnimationManager,
    ) {
        this.app = app
    }
    reset() {
        this.avatars.forEach((avatar) => {
            avatar.entity.destroy()
            this.avatars.delete(avatar.entity.getGuid())
        })
    }
    addAvatar(entity: Entity) {
        const avatar = new Avatar(entity, this.app, this.animationManager)
        this.avatars.set(entity.getGuid(), avatar)
    }

    public exportAvatarsAsJson() {
        const avatarsJson: JSONAvatarsExport = {}
        for (const avatarKey of this.avatars.keys()) {
            const av = this.avatars.get(avatarKey)
            if (av) {
                avatarsJson[av.name] = {
                    avatarInfo: av.avatarInfo ? av.avatarInfo : null,
                    entity: av.entity.getGuid(),
                }
            }
        }

        return avatarsJson
    }
}
