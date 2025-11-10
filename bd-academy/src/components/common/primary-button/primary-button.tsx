import { Button } from 'primereact/button'
import { CSSProperties, FunctionComponent } from 'react'
export type PrimaryButtonProps = {
    label: string
    icon?: string
    rounded?: boolean
    outlined?: boolean
    onClick?: (e: any) => void
    style?: CSSProperties
    type?: 'button' | 'submit' | 'reset'
}

export const PrimaryButton: FunctionComponent<PrimaryButtonProps> = ({ label, icon, rounded = false, outlined = false, onClick, style, type = 'button' }) => {
    return (
        <Button
            outlined={outlined ? outlined : undefined}
            rounded={rounded ? rounded : undefined}
            label={label}
            icon={icon ? icon : undefined}
            onClick={onClick}
            size={'small'}
            style={style}
            type={type}
            pt={{
                label: {
                    className: `text-[12px] leading-[14px] text-bold`,
                },
                icon: {
                    className: `text-[12px] leading-[14px]  text-bold`,
                },
                root: {
                    className: `h-[34px] min-w-[30px] w-[auto] text-[12px] font-[var(--dark-800)] bg-[var(--primary)] border-[var(--primary)]   hover:bg-[var(--secondary)] hover:border-[var(--secondary)]  shadow-none
                        ${outlined ? 'font-[var(--dark-800)] ' : ''}`,
                },
            }}
        ></Button>
    )
}
