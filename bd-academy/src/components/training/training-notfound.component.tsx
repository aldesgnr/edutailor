import { Card } from 'primereact/card'
import { FunctionComponent } from 'react'
import { appConfig } from '../../app.config'
export interface TrainingNotFoundComponentProps {
    message: string
    icon: string
}
export const TrainingNotFoundComponent: FunctionComponent<TrainingNotFoundComponentProps> = ({ message, icon }) => {
    return (
        <Card
            className={' w-[315px] min-w-[315px] max-w-[315px] h-auto min-h-[358px]  relative cursor-default'}
            pt={{
                content: {
                    className: 'flex justify-center items-center pt-[20px] ',
                },
            }}
        >
            <div className={'h-full flex flex-col  gap-[40px]  justify-between'}>
                <img src="/training-notfound.png" className={'w-[283px] h-[153px] rounded-[13px]'} />
                <p className={'text-[12px] leading-[14px]  text-[#ffffff]  '}>{message}</p>
                <div className={'flex flex-row gap-[14px] justify-center align-center '}>
                    <i className={`${icon} cursor-pointer text-[19px]`} />
                </div>
            </div>
        </Card>
    )
}
