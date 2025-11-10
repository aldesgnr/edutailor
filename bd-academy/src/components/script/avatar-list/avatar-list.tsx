//create react component function

import { FunctionComponent, useEffect, useState } from 'react'
import { AvatarInfo } from '../../../lib/editor-manager/editor.types'

export type AvatarListComponentProps = {
    avatars: AvatarInfo[]
    onClickAvatar: (avatar: AvatarInfo) => void
}

export const AvatarListComponent: FunctionComponent<AvatarListComponentProps> = ({ avatars, onClickAvatar }) => {
    const [avatarsToSelect, setAvatarsToSelect] = useState<AvatarInfo[]>(avatars)
    useEffect(() => {
        setAvatarsToSelect(avatars)
    }, [avatars])

    return (
        <div className={'flex flex-row w-full h-full flex-wrap justify-between overflow-y-auto gap-[10px] bg-[var(--content)] rounded-[7px] p-[14px]'}>
            {avatarsToSelect.map((avatar) => (
                <div
                    key={`avatar-${avatar.id}`}
                    className="flex flex-[calc(50%-10px)] flex-col box-1 max-w-[50%] hover:bg-[#f3f3f350] rounded-[7px] bg-[white] cursor-pointer text-center gap-[6px]"
                    onClick={() => onClickAvatar(avatar)}
                >
                    <img className="w-[100px] h-[100px] rounded-[7px]" src={avatar.image} alt={avatar.name} />
                    <div className="pb-[10px]">
                        <span className="min-h-[15px] leading-[15px] text-[12px] text-[var(--dark-800)]">{avatar?.type}</span>
                        <div className="min-h-[15px] leading-[15px] text-[12px] text-[var(--dark-800)]">{avatar?.name}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
