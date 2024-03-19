//create react component function

import { PrimeIcons } from 'primereact/api'
import { Divider } from 'primereact/divider'
import { FunctionComponent } from 'react'
import { ActionButton } from '../common/action-button/action-button.component'
import { Scene } from '../../lib/editor-manager/editor.types'
export enum TrainingSectionComponentEnum {
    QUIZ = 'QUIZ',
    SCENE = 'SCENE',
    FILE = 'FILE',
}
export type TrainingSectionComponent = {
    id: string
    title: string
    description?: string
    type: TrainingSectionComponentEnum
    params?: string[]
    dialogId: string
    sceneTemplate?: Scene
}
export type ScriptSectionComponentCardComponentProps = {
    scriptComponent: TrainingSectionComponent
    index: number
    onClickEdit: () => void
    onClickDelete: () => void
}

export const ScriptSectionComponentCardComponent: FunctionComponent<ScriptSectionComponentCardComponentProps> = ({
    index,
    scriptComponent,
    onClickEdit,
    onClickDelete,
}) => {
    return (
        <div className={'flex flex-row gap-[14px] bg-[var(--content)] rounded-[14px] items-center justify-between px-[14px] h-[50px]'}>
            <div className="flex flex-row jusitify-start items-center gap-[14px]">
                <div className={'flex justify-center  items-center rounded-[50%] border-[1px] border-[white] w-[20px] h-[20px]  pr-[1px]'}>
                    <span>{index}</span>
                </div>
                <div
                    className={` rounded-[7px] p-[10px] border-[1px] leading-[15px] text-[15px] ${
                        scriptComponent.type === TrainingSectionComponentEnum.QUIZ ? 'border-[var(--warning)] text-[var(--warning)]' : ''
                    } 
                ${scriptComponent.type === TrainingSectionComponentEnum.SCENE ? 'border-[var(--danger)] text-[var(--danger)]' : ''}
                ${scriptComponent.type === TrainingSectionComponentEnum.FILE ? 'border-[var(--info)] text-[var(--info)]' : ''}`}
                >
                    {scriptComponent.type === TrainingSectionComponentEnum.QUIZ && <i className={PrimeIcons.QUESTION + ' text-[15px] leading-[15px]'} />}
                    {scriptComponent.type === TrainingSectionComponentEnum.FILE && <i className={PrimeIcons.FILE + ' text-[15px] leading-[15px]'} />}
                    {scriptComponent.type === TrainingSectionComponentEnum.SCENE && <i className={PrimeIcons.ARROWS_H + ' text-[15px] leading-[15px]'} />}
                </div>
                <div className={'flex flex-col min-w-[160px]'}>
                    <div className={'leading-[14px] text-[14px] '}>{scriptComponent.type}</div>
                    <div className={'leading-[14px] text-[10px] '}>{scriptComponent.description}</div>
                </div>
                <Divider
                    layout="vertical"
                    className="max-h-[36px]"
                    pt={{
                        root: { className: 'before:border-[var(--dark-600)] ' },
                    }}
                ></Divider>
                <div className={'flex flex-col min-w-[160px] gap-[7px]'}>
                    {scriptComponent.params?.map((param, index) => <span key={`param_+${index}_${param}`}>{param}</span>)}
                </div>
            </div>
            <div className="flex flex-row  gap-[14px] ">
                <ActionButton icon={PrimeIcons.PENCIL} onClick={onClickEdit} />
                <ActionButton icon={PrimeIcons.TRASH} onClick={onClickDelete} />
            </div>
        </div>
    )
}
