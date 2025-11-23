import { PrimeIcons } from 'primereact/api'
import { Tooltip } from 'primereact/tooltip'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { SIDE_PANEL_WIDTH } from '..'
import { EditorContext } from '../../../contexts/editor-context'
import { AssetInfo, AvatarInfo } from '../../../lib/editor-manager/editor.types'
import { PersonsPanel } from './persons-panel'
import { ScriptsPanel } from './scripts-panel'
import { GlobalToast } from '../../../services/gloabal-toast'
export type EditorRightPanelProps = {}

export enum EditorRightPanelTabs {
    PERSONS = 'PERSONS',
    SCRIPTS = 'SCRIPTS',
}
export const EditorRightPanel: FunctionComponent<EditorRightPanelProps> = () => {
    const { editorManager } = useContext(EditorContext)
    const [avatarsToSelect, setAvatarsToSelect] = useState<any[]>([])
    const [assets, setAssets] = useState<AssetInfo[]>()
    const [selectPerson, setSelectPerson] = useState<any>(null)
    const [objectToReplace, setSelectedObjectToReplace] = useState<any>(null)
    const [avtiveTab, setActiveTab] = useState<EditorRightPanelTabs>(EditorRightPanelTabs.PERSONS)

    useEffect(() => {
        const conf$ = editorManager.trainingSceneLoaded.subscribe((configuration) => {
            if (configuration === null) return
        })
        const predefinedAvatars$ = editorManager.predefinedAvatars.subscribe((predefinedAvatars) => {
            setAvatarsToSelect([...predefinedAvatars])
        })
        const predefinedAssets$ = editorManager.predefinedAssets.subscribe((predefinedAssets) => {
            setAssets([...predefinedAssets])
        })
        const selectPerson$ = editorManager.selectedAvatar.subscribe((selectPerson) => {
            setSelectPerson(selectPerson)
        })
        const objectToReplace$ = editorManager.objectToReplace.subscribe((objectToReplace) => {
            setSelectedObjectToReplace(objectToReplace)
        })

        return () => {
            conf$.unsubscribe()
            predefinedAssets$.unsubscribe()
            predefinedAvatars$.unsubscribe()
            selectPerson$.unsubscribe()
            objectToReplace$.unsubscribe()
        }
    }, [editorManager])

    const onClickAvatar = (avatar: AvatarInfo) => {
        console.log('[RightPanel] Avatar clicked:', avatar.name)
        console.log('[RightPanel] Selected avatar:', editorManager.selectedAvatar.value)
        
        if (editorManager.selectedAvatar.value) {
            // Replace existing avatar
            console.log('[RightPanel] Replacing avatar...')
            editorManager.selectedAvatar.value.replaceAvatar(avatar)
            GlobalToast.toastShow?.('Avatar', 'Avatar replaced successfully!', 'success')
        } else {
            // Must select avatar first (yellow box)
            console.log('[RightPanel] No avatar selected - please select Yellow Box first')
            GlobalToast.toastShow?.('Avatar', 'Please select Avatar (Yellow Box) on scene first.', 'warn')
        }
    }

    return (
        <div
            style={{ minWidth: SIDE_PANEL_WIDTH, width: SIDE_PANEL_WIDTH, height: '100%' }}
            className={'bg-[var(--content)] rounded-[0px_8px_8px_0px] p-[16px_8px_8px_8px] relative'}
        >
            {avtiveTab === EditorRightPanelTabs.PERSONS && <PersonsPanel onClickAvatar={onClickAvatar} avatars={avatarsToSelect}></PersonsPanel>}

            {avtiveTab === EditorRightPanelTabs.SCRIPTS && <ScriptsPanel></ScriptsPanel>}

            {/* Tooltips */}
            <Tooltip target=".tab-persons" content="Manage avatars and characters" position="left" />
            <Tooltip target=".tab-scripts" content="Manage training scripts and sections" position="left" />
            
            <div className={'absolute top-[8px] left-[-115px] '}>
                <div className={'flex flex-col min-w-[115px] '}>
                    <div
                        className={`tab-persons flex flex-row h-[60px] justify-start items-center w-full gap-[8px] px-[8px] rounded-[8px_0px_0px_8px] cursor-pointer
                        hover:bg-[var(--dark-600)]
                        ${avtiveTab === EditorRightPanelTabs.PERSONS ? 'bg-[var(--content)] text-[var(--primary)]' : ' bg-[var(--dark-800)]'}`}
                        onClick={() => setActiveTab(EditorRightPanelTabs.PERSONS)}
                    >
                        <i className={PrimeIcons.USERS} />
                        <span>Persons</span>
                    </div>
                    <div
                        className={`tab-scripts flex flex-row  h-[60px] justify-start items-center   w-full gap-[8px] px-[8px] rounded-[8px_0px_0px_8px] cursor-pointer
                        hover:bg-[var(--dark-600)] pointer-events-none
                            ${avtiveTab === EditorRightPanelTabs.SCRIPTS ? 'bg-[var(--content)] text-[var(--primary)]' : ' bg-[var(--dark-800)]'}`}
                        onClick={() => setActiveTab(EditorRightPanelTabs.SCRIPTS)}
                    >
                        <div className="opacity-10">
                            <i className={PrimeIcons.COMMENTS} />
                            <span>Scripts</span>
                        </div>
                        <div className={'w-[calc(100%-16px)] flex h-[60px] justify-center items-center absolute'}>
                            <span className={'text-[var(--primary)] '} style={{ fontSize: '12px' }}>
                                Comming soon!
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
