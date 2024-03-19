import { PrimeIcons } from 'primereact/api'
import { FunctionComponent, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../navbar/navbar'
import { PrimaryButton } from '../primary-button/primary-button'
import { Sidebar } from '../sidebar/sidebar'
import { SidebarElement } from '../sidebar/sidebar-element'
import './app-layout.css'
import { appConfig } from '../../../app.config'
export enum AppMenuItemsEnum {
    DASHBOARD = 'dashboard',
    FAVORITE = 'favorite',
    DRAFTS = 'drafts',
    TRAININGS = 'trainings',
    COMPONENTS = 'components',
    SETTINGS = 'settings',
}
export const AppMenuItems: Array<{ icon: string; title: string; url: string; enum: AppMenuItemsEnum }> = [
    { icon: PrimeIcons.HOME, title: 'Home', url: '/dashboard', enum: AppMenuItemsEnum.DASHBOARD },
    { icon: PrimeIcons.HEART, title: 'Favorite', url: '/favorite', enum: AppMenuItemsEnum.FAVORITE },
    { icon: PrimeIcons.PENCIL, title: 'Drafts', url: '/drafts', enum: AppMenuItemsEnum.DRAFTS },
    { icon: PrimeIcons.WINDOW_MAXIMIZE, title: 'Trainings', url: '/trainings', enum: AppMenuItemsEnum.TRAININGS },
    { icon: PrimeIcons.TABLE, title: 'Components', url: '/components', enum: AppMenuItemsEnum.COMPONENTS },
    { icon: PrimeIcons.COG, title: 'Global settings', url: '/settings', enum: AppMenuItemsEnum.SETTINGS },
]

export const AppLayout: FunctionComponent = () => {
    const [selected, setSelected] = useState<AppMenuItemsEnum>(AppMenuItemsEnum.DASHBOARD)
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true)
    const invisibleMenuRoutes = ['/trainings/edit', '/trainings/new']

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const path = location.pathname.split('/')[1]
        if (path === 'editor' || path === 'dialog') setSelected(AppMenuItemsEnum.TRAININGS)
        else setSelected(AppMenuItemsEnum[path.toUpperCase() as keyof typeof AppMenuItemsEnum])
        if (invisibleMenuRoutes.includes(location.pathname)) {
            setSidebarVisible(false)
        } else {
            setSidebarVisible(true)
        }
    }, [location])

    const onCreateNew = () => {
        navigate(`/trainings/new?trainingType=VR`)
    }
    return (
        <div className={'flex flex-col h-full w-full '}>
            <Navbar />
            <div className={'flex flex-row  h-[calc(100%-63px)] w-full bg-[var(--content)]'}>
                {sidebarVisible && (
                    <Sidebar>
                        <div className={'sidebar-elements'}>
                            <div className="flex flex-row justify-start items-center gap-2 p-[7px] pl-[10px] h-[60px] ">
                                <PrimaryButton
                                    label=""
                                    icon={PrimeIcons.PLUS}
                                    onClick={() => onCreateNew()}
                                    style={{ height: '35px', maxWidth: '35px' }}
                                ></PrimaryButton>
                                <span className={' sidebar-element__title text-[12px] leading-[14px] text-[#ffffff] font-bold cursor-default'}>Create new</span>
                            </div>
                            {AppMenuItems &&
                                AppMenuItems.map((menuItem) => (
                                    <SidebarElement
                                        key={menuItem.title}
                                        icon={menuItem.icon}
                                        title={menuItem.title}
                                        url={menuItem.url}
                                        selected={selected === menuItem.enum}
                                    />
                                ))}
                        </div>
                    </Sidebar>
                )}

                <div className={`app-layout flex  w-full justify-center items-center overflow-hidden ${sidebarVisible ? '' : 'app-layout--nosidebar'} `}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
