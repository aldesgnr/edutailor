import { PrimeIcons } from 'primereact/api'
import { FunctionComponent } from 'react'
import './hint.css'
export type HintProps = {
    text: string
}
export const Hint: FunctionComponent<HintProps> = ({ text }) => {
    return (
        <div className="hint text-left">
            <div className="flex flex-row gap-[8px] h-[30px] py-[8px] justify-center items-center">
                <i className={PrimeIcons.INFO_CIRCLE + ' text-[var(--primary)]'}></i>
                <span className={'text-[var(--sidebarText)]'}>Hint!</span>
            </div>
            <span className={'text-[var(--dark-200)] text-[12px] leading-[21px]'}>{text}</span>
        </div>
    )
}
