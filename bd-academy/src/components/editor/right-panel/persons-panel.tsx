import { Divider } from 'primereact/divider'
import { FunctionComponent, useEffect, useState } from 'react'
import { Hint } from '../../common/hint/hint'
import { AvatarListComponent } from '../../script/avatar-list/avatar-list'
import { AvatarInfo } from '../../../lib/editor-manager/editor.types'
export type PersonsPanelProps = {
    onClickAvatar: (avatar: AvatarInfo) => void
    avatars: AvatarInfo[]
}

export const PersonsPanel: FunctionComponent<PersonsPanelProps> = ({ onClickAvatar, avatars }) => {
    const [avatarsToSelect, setAvatarsToSelect] = useState<AvatarInfo[]>([])

    useEffect(() => {
        setAvatarsToSelect([...avatars])
    }, [avatars])

    return (
        <div className={' flex flex-col  gap-[16px] text-center'}>
            <p>Persons</p>
            <Divider></Divider>
            <Hint text={'Click on a Person to add it to the scene'}></Hint>
            <div className={'flex gap-[8px]'}>
                <AvatarListComponent avatars={avatarsToSelect} onClickAvatar={onClickAvatar}></AvatarListComponent>
            </div>
        </div>
    )
}
