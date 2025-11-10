import { Button } from 'primereact/button'
import { FunctionComponent } from 'react'
export type ActionButtonProps = {
    icon: string
    onClick?: () => void
}

export const ActionButton: FunctionComponent<ActionButtonProps> = ({ icon, onClick }) => {
    return (
        <Button
            outlined={true}
            icon={icon}
            onClick={onClick}
            size={'small'}
            pt={{
                icon: {
                    className: `text-[12px] leading-[14px]  text-bold  `,
                },
                root: {
                    className: `p-[12px] h-[28px] w-[28px] w-[auto] text-[12px] text-[var(--sidebarText)] font-[var(--dark-800)] bg-[var(--dark-800)] border-[var(--sidebarText)]   hover:border-[var(--secondary)]   hover:text-[var(--secondary)]   shadow-none
                       `,
                },
            }}
        ></Button>
    )
}
