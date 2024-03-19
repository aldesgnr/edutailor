import { Chip } from 'primereact/chip'
import { FunctionComponent } from 'react'

export type EditorChipComponentProps = {
    pre: string
    content: string
}
export const EditorChipComponent: FunctionComponent<EditorChipComponentProps> = ({ pre, content }) => {
    const chipContent = (
        <div className="flex flex-row gap-[8px]">
            <span className="text-[var(--primary)]">{pre}</span>
            {content}
        </div>
    )

    return (
        <Chip
            template={chipContent}
            pt={{
                root: {
                    className: 'bg-[var(--dark-800)] rounded-[24px] h-[32px] px-[8px]',
                },
            }}
        />
    )
}
