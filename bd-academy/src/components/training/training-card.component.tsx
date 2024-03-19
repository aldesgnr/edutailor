import moment from 'moment'
import { PrimeIcons } from 'primereact/api'
import { Card } from 'primereact/card'
import { Chip } from 'primereact/chip'
import { FunctionComponent, useEffect, useState } from 'react'
import { Labels } from '../../pages/dashboard/dashboard.page'
import { CustomChip } from '../common/chip/chip.component'
import { TrainingScriptSection } from '../script/script-section'
import { appConfig } from '../../app.config'

export type TrainingData = {
    title: string
    description: string
    id: string
    trainingValue: string[]
    trainingSections: TrainingScriptSection[]
    labels?: Labels[]
    favorite?: boolean
    updatedAt?: string
    createdAt?: string
    delatedAt?: string
    image?: string
    published: boolean
    type: 'DRAFT'
    availableUntil?: string | null
    durationTime?: number
}
export type TrainingCardComponentProps = {
    trainingData: TrainingData
    type: TrainingCardComponentTypes
    onClick: () => void
    onClickChangeFavorite?: () => void
}
export enum TrainingCardComponentTypes {
    NEW = 'NEW',
    TRAINING = 'TRAINING',
}
export const TrainingCardComponent: FunctionComponent<TrainingCardComponentProps> = ({ trainingData, type, onClick, onClickChangeFavorite }) => {
    const [training, setTrainingData] = useState<TrainingData | null>(null)
    // const onClickChangeFavorite = () => {
    //     const t = { ...training }
    //     t.favorite = !training.favorite
    // }
    useEffect(() => {
        setTrainingData(trainingData)
    }, [trainingData])

    const getIconOfChip = (label: Labels) => {
        switch (label) {
            case Labels.READING:
                return PrimeIcons.BOOK
            case Labels.QUIZ:
                return PrimeIcons.QUESTION
            case Labels.SCRIPT:
                return PrimeIcons.CODE
            case Labels.SCENE:
                return PrimeIcons.MAP_MARKER
        }
    }
    if (training === null) return <></>
    if (type === TrainingCardComponentTypes.NEW) {
        return (
            <Card
                key={'card_' + training.id}
                title={training.title}
                className={'w-[260px] min-w-[260px] max-w-[260px] h-[158px] min-h-[158px] max-h-[158px] relative cursor-default drop-shadow-md	'}
                footer={() => (
                    <div className={'flex flex-row justify-end align-center'}>
                        <i className={`${PrimeIcons.ARROW_RIGHT} cursor-pointer text-[19px]`} onClick={onClick} />
                    </div>
                )}
                pt={{
                    body: {
                        className: 'gap-[14px]',
                    },
                    content: {
                        className: 'flex-1',
                    },
                }}
            >
                <div className={'flex flex-col  gap-[14px] pb-[14px]'}>
                    <p className={'text-[12px] leading-[18px]'}>{training.description}</p>
                    <div className={'flex flex-row flex-wrap gap-[16px]'}>
                        {training.labels?.map((labelName) => <Chip key={training.id + '_' + labelName} label={labelName} />)}
                    </div>
                </div>
            </Card>
        )
    }
    return (
        <Card
            key={'card_' + training.id}
            className={' w-[315px] min-w-[315px] max-w-[315px] h-auto min-h-[358px]  relative cursor-default'}
            footer={() => (
                <div className={'flex flex-row gap-[14px] justify-end align-center '}>
                    <i
                        className={` ${training.favorite ? PrimeIcons.HEART_FILL + ' text-[var(--primary)]' : PrimeIcons.HEART}  cursor-pointer text-[19px]`}
                        onClick={onClickChangeFavorite}
                    />
                    <i className={`${PrimeIcons.ARROW_RIGHT} cursor-pointer text-[19px]`} onClick={onClick} />
                </div>
            )}
        >
            <div className={'flex flex-col  gap-[14px] pb-[14px] justify-between'}>
                <img src={`${appConfig().BASE_URL}/szkolenie-min.png`} className={'w-[283px] h-[153px] rounded-[13px]'} />
                <p className={'flex justify-start items-center gap-[8px]'}>
                    <i className={PrimeIcons.CLOCK + ' text-[12px]'} />
                    <span className={'text-[10px] text-[#C5C7CC] leading-[13px]'}>
                        Last activity {trainingData.updatedAt ? moment(trainingData.updatedAt).format('DD.MM.YY | HH:mm') : '25.10.23 | 8:34'}
                    </span>
                </p>
                <p className={'text-[12px] leading-[14px]  text-[#ffffff] '}>{training.title}</p>
                <p className={'flex flex-row gap-2  align-center'}>
                    <i className={`${PrimeIcons.USERS} flex align-center justify-center text-[12px] leading-[24px] `} />
                    <span className={'text-[10px] text-[#C5C7CC] leading-[13px]'}>
                        <span className="text-[var(--primary)]">25</span> Users
                    </span>
                </p>
                <p className={'flex flex-row gap-2  align-center '}>
                    <i className={`${PrimeIcons.CHECK_SQUARE} flex align-center justify-center text-[12px]  leading-[24px]`} />
                    <span className={'text-[10px] text-[#C5C7CC] leading-[13px]'}>
                        <span className="text-[var(--primary)]">87%</span> Average Score
                    </span>
                </p>
                <div className={'flex flex-row flex-wrap gap-[16px] '}>
                    {training.labels?.map((labelName) => (
                        <CustomChip key={training.id + '_' + labelName} pre={'1'} content={labelName} icon={getIconOfChip(labelName)} />
                        // <Chip key={training.id + '_' + labelName} label={'1 ' + labelName} icon={getIconOfChip(labelName) + ' text-[12px]'} />
                    ))}
                </div>
            </div>
        </Card>
    )
}
