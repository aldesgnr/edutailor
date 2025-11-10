import { FunctionComponent, useState } from 'react'
import './sidebar.css'
import { useNavigate } from 'react-router-dom'

export type SidebarElementProps = { logo?: string; icon?: string; title: string; tooltip?: string; url: string; selected: boolean }

export const SidebarElement: FunctionComponent<SidebarElementProps> = ({ logo, title, icon, url, selected }) => {
    const navigate = useNavigate()
    return (
        <div className={`sidebar-element ${selected ? 'sidebar-element--selected' : ''} `} onClick={() => navigate(url)}>
            {logo && <img src={logo} alt={title} />}
            {icon && !logo && <i className={icon}></i>}
            <span className={'sidebar-element__title'}>{title}</span>
        </div>
    )
}
