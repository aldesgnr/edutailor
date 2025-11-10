import { PrimeIcons } from 'primereact/api'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { MenuItem } from 'primereact/menuitem'
import { FunctionComponent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginManager } from '../../../services/login-manager.service'
import './navbar.css'
import { appConfig } from '../../../app.config'

export type NavbarProps = {}

export const Navbar: FunctionComponent<NavbarProps> = ({}) => {
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
    return (
        <div className={'navbar'}>
            <img className={'logo cursor-pointer'} src={`${appConfig().BASE_URL}/logo.png`} alt={'logo'} onClick={() => navigate('/dashboard')} />
            <div className="navbar-right">
                {/* FOR FUTURE LAYOUT */}
                {/* <i className={PrimeIcons.COMMENT}></i>
                <i className={PrimeIcons.BELL + ' p-overlay-badge'} style={{ fontSize: '20px' }}>
                    <Badge value="2" severity="danger" style={{ fontSize: '10px' }}></Badge>
                </i> */}
                <div className="navbar-menubar">
                    <Menu model={items} popup ref={menuRight} id="popup_menu_right" popupAlignment="right" />
                    <div
                        className={'flex gap-[10px] justify-center items-center cursor-pointer hover:text-[#38f2ae] p-[10px]'}
                        onClick={(event) => menuRight.current?.toggle(event)}
                        aria-controls="popup_menu_right"
                        aria-haspopup
                    >
                        <Avatar
                            image={`${appConfig().BASE_URL}/person-min.png`}
                            shape="circle"
                            className={' border-solid border-[1px] border-[#38f2ae]'}
                        ></Avatar>
                        {/* FOR FUTURE LAYOUT */}
                        {/* JESSICA ANDREWS <i className={PrimeIcons.CHEVRON_DOWN + ' text-[13px]'} /> */}
                        <i className={PrimeIcons.CHEVRON_DOWN + ' text-[13px] '} />
                    </div>
                </div>
            </div>
        </div>
    )
}
