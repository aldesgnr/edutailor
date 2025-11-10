import { Chip } from 'primereact/chip'
import { FunctionComponent } from 'react'

export type ChipProps = {
    pre: string
    content: string
    icon?: string
}
export const CustomChip: FunctionComponent<ChipProps> = ({ pre, content, icon }) => {
    const chipContent = (
        <>
            {icon && <i className={icon + ' text-[12px]'}></i>}
            <div className="flex flex-row">
                <span className="text-[var(--primary)]">{pre}</span>&nbsp;&nbsp;{content}
            </div>
        </>
    )

    return <Chip template={chipContent} />
}
