// real player me api

import { http } from '../interceptors/axios'

export interface RealPlayerMeAvatarInfo {}
export class RealPlayerMe {
    static getAvatarInfo = (id: string, quality: string = 'low') => {
        return http.get<RealPlayerMeAvatarInfo>(`https://models.readyplayer.me/${id}.glb?quality=${quality}`, {})
    }
    static getAvatarImage = (id: string) => {
        return http.get<RealPlayerMeAvatarInfo>(`https://models.readyplayer.me/${id}.png`, {})
    }
}
