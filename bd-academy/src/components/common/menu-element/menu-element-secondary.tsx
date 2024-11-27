import { Button } from 'primereact/button'
import { FunctionComponent } from 'react'
export type MenuElementSecondaryProps = {
    label: string
    icon?: string
    disabled?: boolean

    onClick?: () => void
}

export const MenuElementSecondary: FunctionComponent<MenuElementSecondaryProps> = ({ label, icon, disabled = false, onClick }) => {
    const outlined = true

    return (
        <Button
            rounded={true}
            outlined={outlined}
            label={label}
            icon={icon}
            disabled={disabled}
            size={'small'}
            onClick={onClick}
            pt={{
                label: {
                    className: `text-[12px] leading-[14px] text-bold duration-0`,
                },
                icon: {
                    className: `text-[12px] leading-[14px] text-bold duration-0`,
                },
                root: {
                    className: `h-[32px] text-[12px] hover:bg-transparent hover:text-[var(--primary)] duration-0 shadow-none ${
                        outlined
                            ? 'text-[var(--dark-200)] bg-[transparent]  border-[var(--dark-200)] hover:text-[var(--secondary)] hover:bg-[transparent] hover:border-[var(--primary)] '
                            : ''
                    } `,
                },
            }}
        ></Button>
    )
}
