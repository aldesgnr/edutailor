import { Button } from 'primereact/button'
import { FunctionComponent } from 'react'
export type RoundedButtonProps = {
    icon: string
    size?: 'large' | 'small' | undefined
    onClick?: () => void
}

export const RoundedButton: FunctionComponent<RoundedButtonProps> = ({ icon, size = 'large', onClick }) => {
    return (
        <Button
            rounded={true}
            icon={icon}
            size={size}
            onClick={onClick}
            pt={{
                label: {
                    className: `text-[17px] leading-[17px] `,
                },
                icon: {
                    className: `text-[17px] leading-[17px] `,
                },
                root: {
                    className: `h-[53px] w-[53px]  border-0 text-[var(--dark-200)] bg-[var(--roundButton)] hover:bg-[var(--primary)] hover:text-[var(--dark-800)]  `,
                },
            }}
        ></Button>
    )
}
