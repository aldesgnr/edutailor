import { PrimeIcons } from 'primereact/api'
import { MenuItem } from 'primereact/menuitem'
import { BaseSyntheticEvent, ChangeEventHandler, EventHandler, FunctionComponent, SyntheticEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginManager } from '../../../services/login-manager.service'
import { InputText } from 'primereact/inputtext'

export type SearchBarProps = {
    onSearch: (e: any) => void
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({ onSearch }) => {
    const navigate = useNavigate()
    const menuRight = useRef<null | any>(null)
    const items: MenuItem[] = [
        {
            id: 'settings',
            label: 'Settings',
            icon: PrimeIcons.COG,
            command: () => navigate('/settings'),
        },
        {
            label: 'Logout',
            icon: PrimeIcons.POWER_OFF,
            command: () => {
                loginManager.logout()
                navigate('/auth/login')
            },
        },
    ]
    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            onSearch(e)
        }
    }
    return (
        <div className="flex flex-row justify-center p-[8px_0px] h-[60px] items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search text-[14px] cursor-pointer" onClick={onSearch} />
                <InputText placeholder="Search" onChange={onSearch} onKeyDown={handleKeyDown} className=" p-[8px] indent-[24px]" />
            </span>
        </div>
    )
}
