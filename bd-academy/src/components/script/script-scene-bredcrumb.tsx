//create react component function

import { PrimeIcons } from 'primereact/api'
import { BreadCrumb } from 'primereact/breadcrumb'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { appConfig } from '../../app.config'
import { EditorContext } from '../../contexts/editor-context'
import { EditorChipComponent } from '../common/chip/editor-chip.component'
import { SecondaryButton } from '../common/secondary-button/secondary-button'
import { MenuItem } from 'primereact/menuitem'
export interface HomePath {
    icon: string
    url: string
    title: string
    subtitle: string
    template: any
}
export type ScriptSceneBredcrumbComponentProps = {
    home: HomePath
    items: HomePath[]
    onClickPreviewScene: () => void
}

export const ScriptSceneBredcrumbComponent: FunctionComponent<ScriptSceneBredcrumbComponentProps> = ({
    home: homePath,
    items: itemsPath,
    onClickPreviewScene,
}) => {
    const { editorManager } = useContext(EditorContext)
    const [maximized, setMaximized] = useState<boolean>(false)
    const [maximizeContent, setMaximizeContent] = useState<Element | null>(null)
    const [home, setHome] = useState<HomePath>()
    const [items, setItems] = useState<MenuItem[]>()

    const iconItemTemplate = (item: any, options: any) => {
        return (
            <a className={`${options.className} flex flex-row gap-[6px]`}>
                <span className={item.icon}></span>
                <div className={`${options.className} flex flex-col gap-[2px] justify-start items-start text-left`}>
                    <span className={'font-[12px] text-[var(--warning)]'}>{item.title}</span>
                    <span className={'font-[14px]]'}>{item.subtitle}</span>
                </div>
            </a>
        )
    }
    // const items = [
    //     { icon: PrimeIcons.DATABASE, title: 'Section:', subtitle: 'Greetings', template: iconItemTemplate },
    //     { icon: PrimeIcons.ARROWS_H, title: 'Scene:', subtitle: "Doctror's Office", template: iconItemTemplate },
    // ]

    // const home  = {
    //     icon: PrimeIcons.WINDOW_MAXIMIZE,
    //     url: '/trainings',
    //     title: 'Trainings:',
    //     subtitle: 'How to conduct a patient interview',
    //     template: iconItemTemplate,
    // }

    useEffect(() => {
        homePath.template = iconItemTemplate
        setHome(homePath)
    }, [homePath])

    useEffect(() => {
        const templatedItemsPath = itemsPath.map((item) => {
            item.template = iconItemTemplate
            return item
        })
        setItems(templatedItemsPath)
    }, [itemsPath])

    const onClickMaximize = () => {
        if (!maximizeContent) return
        if (!maximized) {
            if ((maximizeContent as HTMLDivElement).requestFullscreen) {
                ;(maximizeContent as HTMLDivElement).requestFullscreen()
            }
        } else {
            if (document.hasFocus() && document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
        setMaximized(!maximized)
    }

    useEffect(() => {
        const checkMaximized = () => {
            const max = document.fullscreen !== null ? document.fullscreen : false
            setMaximized(max)
        }

        const root = document.querySelector('.app-layout')
        if (!root) return
        setMaximizeContent(root)
        checkMaximized()

        root.addEventListener('fullscreenchange', checkMaximized)

        checkMaximized()
        return () => {
            maximizeContent?.removeEventListener('fullscreenchange', checkMaximized)
        }
    }, [document])

    return (
        <div className={'flex flex-row justify-between items-center bg-[var(--content)]  min-h-[50px] max-h-[50px] p-0 px-[14px] rounded-[14px]'}>
            <BreadCrumb model={items} home={home} />
            <div className={'editor-content flex flex-row gap-[5px] h-full justify-center items-center'}>
                <EditorChipComponent content="Persons" pre={'0'} />
                <EditorChipComponent content="Scripts" pre={'0'} />
                <SecondaryButton
                    label="Preview scene"
                    icon={PrimeIcons.CAMERA}
                    onClick={() => {
                        onClickPreviewScene()
                    }}
                    rounded
                ></SecondaryButton>
                {maximized ? (
                    <SecondaryButton label="Min. window" icon={PrimeIcons.WINDOW_MINIMIZE} onClick={onClickMaximize} rounded></SecondaryButton>
                ) : (
                    <SecondaryButton label="Max. window" icon={PrimeIcons.WINDOW_MAXIMIZE} onClick={onClickMaximize} rounded></SecondaryButton>
                )}
            </div>
        </div>
    )
}
