import { Button, ButtonProps } from 'primereact/button'
import { IconType } from 'primereact/utils'
import { FunctionComponent, useEffect, useState } from 'react'
export type MenuElementProps = {
    label: string
    icon?: IconType<ButtonProps>
    active?: boolean
    disabled?: boolean
    onClick?: () => void
}

export const MenuElement: FunctionComponent<MenuElementProps> = ({ label, icon, active = false, disabled = false, onClick }) => {
    const outlined = true
    const [activeState, setActiveState] = useState(active)
    useEffect(() => {
        setActiveState(active)
    }, [active])

    return (
        <Button
            rounded={true}
            outlined={outlined}
            label={label}
            icon={icon}
            size={'small'}
            iconPos={'right'}
            onClick={onClick}
            disabled={disabled}
            pt={{
                label: {
                    className: `text-[12px] leading-[14px] text-bold duration-0`,
                    path: {
                        className: `fill-red`,
                    },
                },
                icon: {
                    className: `text-[12px] leading-[14px] text-bold duration-0`,
                    path: {
                        className: `fill-red`,
                    },
                },
                root: {
                    className: `h-[42px] text-[12px] hover:bg-transparent hover:text-[var(--primary)] duration-0  shadow-none flex-row-reverse gap-[8px] 
                   
                    ${
                        outlined
                            ? 'text-[var(--dark-200)] bg-[transparent]  border-[var(--dark-200)] hover:text-[var(--primary)] hover:border-[var(--primary)] '
                            : ''
                    } 
                     ${activeState ? 'text-[var(--dark-800)]  bg-[var(--primary)]  border-[var(--primary)]' : ''}`,
                },
            }}
        ></Button>
    )
}
