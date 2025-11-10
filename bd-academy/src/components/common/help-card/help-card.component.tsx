import { PrimeIcons } from 'primereact/api'
import { FunctionComponent } from 'react'
import { appConfig } from '../../../app.config'

export const HelpCardComponent: FunctionComponent = () => {
    return (
        <div
            key={'card_ttttt'}
            className={
                'p-card p-[0px] rounded-[16px] bg-[var(--dark-800)] w-[370px] min-w-[370px] max-w-[370px] h-[158px] min-h-[158px] max-h-[158px] h-auto flex  cursor-default drop-shadow-md '
            }
        >
            <div className="w-[370px] min-w-[370px] max-w-[370px] h-[158px] min-h-[158px] max-h-[158px] h-auto opacity-35 pointer-events-none flex flex-row">
                <div
                    className={` bg-center bg-no-repeat  min-w-[158px] h-[158px]`}
                    style={{ backgroundImage: `url(${appConfig().BASE_URL}/help-card.png)` }}
                ></div>
                <div className={'flex flex-col w-auto  gap-[14px]   p-[16px]'}>
                    <h3
                        className={'p-card-title text-[20px] leading-[19px] text-[var(--cardTitleColor)] font-medium '}
                    >{`Don't know how to create a VR training?`}</h3>
                    <p className={'text-[12px] leading-[18px] color-[#B2B5C0]'}>Learn better how to do this.</p>
                    <div className={'flex flex-row justify-end align-center'}>
                        <i className={`${PrimeIcons.ARROW_RIGHT} cursor-pointer text-[19px]`} />
                    </div>
                </div>
            </div>
            <div className={'w-full h-full flex  justify-center items-center absolute'}>
                <span className={'text-[var(--primary)] '} style={{ fontSize: '20px' }}>
                    Comming soon!
                </span>
            </div>
        </div>
    )
}
