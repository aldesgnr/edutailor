import { Button } from 'primereact/button'
import { FunctionComponent } from 'react'
export type SecondaryButtonProps = {
    label: string
    icon?: string
    rounded?: boolean
    outlined?: boolean
    disabled?: boolean
    onClick?: () => void
}

export const SecondaryButton: FunctionComponent<SecondaryButtonProps> = ({ label, icon, rounded = false, outlined = true, onClick, disabled = false }) => {
    return (
        <Button
            rounded={rounded}
            outlined={outlined}
            disabled={disabled}
            label={label}
            icon={icon}
            size={'small'}
            onClick={onClick}
            pt={{
                label: {
                    className: `text-[12px] leading-[14px] duration-0`,
                },
                icon: {
                    className: `text-[12px] leading-[14px] duration-0`,
                },
                root: {
                    className: `justify-center h-[34px]  text-[12px] hover:bg-transparent hover:text-[var(--primary)] duration-0 shadow-none ${
                        outlined
                            ? 'text-[var(--dark-200)] bg-[transparent]  border-[var(--dark-200)] hover:text-[var(--primary)] hover:border-[var(--primary)] '
                            : 'text-[var(--dark-800)] bg-[var(--secondary)]  border-[var(--primary)]'
                    } `,
                },
            }}
        ></Button>
    )
}
