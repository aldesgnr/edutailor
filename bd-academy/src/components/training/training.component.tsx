import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TrainingService, { uuidv4 } from '../../services/training/training.service'
import { TrainingData } from './training-card.component'
import './training.css'

import moment from 'moment'
import 'primeicons/primeicons.css' //icons
import { PrimeIcons } from 'primereact/api'
import 'primereact/resources/primereact.min.css' //core css
import { Toolbar } from 'primereact/toolbar'
import { TrainingContext } from '../../contexts/training-context'
import { InfinityLoader } from '../common/infinity-loader/infinity-loader'
import { MenuElement } from '../common/menu-element/menu-element'
import { MenuElementSecondary } from '../common/menu-element/menu-element-secondary'
import { TrainingParticipantsTabComponent } from './tabs/training-participants-tab.component'
import { TrainingScriptsTabComponent } from './tabs/training-scripts-tab.component'
import { TrainingSettingsTabComponent } from './tabs/training-settings-tab.component'
import { appConfig } from '../../app.config'
import { GlobalToast } from '../../services/gloabal-toast'
import { EditorContext } from '../../contexts/editor-context'

const enum TrainingTab {
    SCRIPTS = 'scripts',
    SETTINGS = 'settings',
    PARTICIPANTS = 'participants',
}
export enum TrainingComponentMode {
    EDIT = 'EDIT',
    VIEW = 'VIEW',
    ADD = 'ADD',
}

export const TrainingComponent: FunctionComponent = () => {
    const { trainingData, updateTrainingData } = useContext(TrainingContext)
    const { editorManager } = useContext(EditorContext)
    const [trainingComponentMode, setTrainingComponentMode] = useState<TrainingComponentMode>(TrainingComponentMode.EDIT)

    const [trainingUUID, setTrainingUUID] = useState<string | null>(null)
    const [history, setHistory] = useState<TrainingTab[]>([])
    const [activeIndex, setActiveIndex] = useState<TrainingTab>(TrainingTab.SETTINGS)
    const [localTrainingData, setLocalTrainingData] = useState<TrainingData | null>(null)

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const tUUID = searchParams.get('trainingUUID')
        if (tUUID === null) {
            setTrainingComponentMode(TrainingComponentMode.ADD)
            const newTrainingdata: TrainingData = {
                title: 'New training',
                description: 'New training',
                trainingValue: [],
                trainingSections: [],
                id: uuidv4(),
                durationTime: 15,
                published: false,
                type: 'DRAFT',
                availableUntil: moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            }
            updateTrainingData(newTrainingdata, true, false)

            return
        }
        setTrainingComponentMode(TrainingComponentMode.EDIT)
        setTrainingUUID(tUUID)
    }, [location])

    useEffect(() => {
        !localTrainingData && setLocalTrainingData(trainingData)
    }, [trainingData])

    const setActiveTab = (tab: TrainingTab) => {
        const historyT = [...history]
        historyT.push(activeIndex)
        setHistory(historyT)
        setActiveIndex(tab)
    }
    useEffect(() => {
        if (trainingUUID === null) return
        TrainingService.getTraining(trainingUUID).then((response) => {
            const newTrainingdata: TrainingData = response.data
            updateTrainingData(newTrainingdata, true, false)
        })
    }, [trainingUUID])

    const onClickPublishTraining = () => {
        console.log('onClickPublishTraining')
        updateTrainingData(trainingData, true, true).then(() => {
            Promise.all([editorManager.saveScene(), editorManager.scenarioEngine.saveDialog()])
                .then(async (values) => {
                    window.open(`${appConfig().BASE_URL}/viewer?trainingSceneUUID=${editorManager.trainingSceneUUID}`, '_blank', 'noreferrer')
                })
                .catch((err) => {
                    GlobalToast.toastShow?.('Error', err.message, 'error')
                })
        })
    }
    const onClickBack = () => {
        if (history.length === 0) {
            return navigate('/trainings')
        }
        const last = history.pop()
        if (last) {
            setActiveIndex(last)
        }
    }

    const startContent = <MenuElementSecondary label={'Back'} icon={PrimeIcons.ANGLE_LEFT} onClick={onClickBack} />
    const centerContent = (
        <div className={'flex flexRow gap-[18px]'}>
            <MenuElement
                icon={
                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3.92857 1H16.0714C17.4169 1 18.5 2.08314 18.5 3.42857V15.5714C18.5 16.9169 17.4169 18 16.0714 18H3.92857C2.58314 18 1.5 16.9169 1.5 15.5714V3.42857C1.5 2.08314 2.58314 1 3.92857 1Z"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5.14258 4.64453H6.35686"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M7.57087 5.85826C7.24882 5.85826 6.93996 5.73033 6.71224 5.5026C6.48452 5.27488 6.35658 4.96602 6.35658 4.64397C6.35658 4.32192 6.48452 4.01307 6.71224 3.78534C6.93996 3.55762 7.24882 3.42969 7.57087 3.42969C7.73033 3.42969 7.88823 3.4611 8.03556 3.52212C8.18288 3.58314 8.31674 3.67259 8.4295 3.78534C8.54226 3.8981 8.6317 4.03196 8.69272 4.17929C8.75375 4.32661 8.78516 4.48451 8.78516 4.64397C8.78516 4.80344 8.75375 4.96134 8.69272 5.10866C8.6317 5.25598 8.54226 5.38985 8.4295 5.5026C8.31674 5.61536 8.18288 5.7048 8.03556 5.76583C7.88823 5.82685 7.73033 5.85826 7.57087 5.85826Z"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8.78516 4.64456L14.8566 4.64453"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M14.857 9.5H13.6427"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12.4282 10.7137C12.7502 10.7137 13.0591 10.5858 13.2868 10.3581C13.5145 10.1303 13.6424 9.82149 13.6424 9.49944C13.6424 9.17739 13.5145 8.86854 13.2868 8.64081C13.0591 8.41309 12.7502 8.28516 12.4282 8.28516C12.1061 8.28516 11.7972 8.41309 11.5695 8.64081C11.3418 8.86854 11.2139 9.17739 11.2139 9.49944C11.2139 9.82149 11.3418 10.1303 11.5695 10.3581C11.7972 10.5858 12.1061 10.7137 12.4282 10.7137Z"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M11.2141 9.50003L5.14267 9.5"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5.14258 14.3555H6.35686"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M7.57087 15.5731C7.24882 15.5731 6.93996 15.4452 6.71224 15.2174C6.48452 14.9897 6.35658 14.6809 6.35658 14.3588C6.35658 14.0368 6.48452 13.7279 6.71224 13.5002C6.93996 13.2725 7.24882 13.1445 7.57087 13.1445C7.73033 13.1445 7.88823 13.1759 8.03556 13.237C8.18288 13.298 8.31674 13.3874 8.4295 13.5002C8.54226 13.6129 8.6317 13.7468 8.69272 13.8941C8.75375 14.0415 8.78516 14.1994 8.78516 14.3588C8.78516 14.5183 8.75375 14.6762 8.69272 14.8235C8.6317 14.9708 8.54226 15.1047 8.4295 15.2174C8.31674 15.3302 8.18288 15.4196 8.03556 15.4807C7.88823 15.5417 7.73033 15.5731 7.57087 15.5731Z"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M8.78516 14.3555L14.8566 14.3555"
                            stroke={activeIndex === TrainingTab.SETTINGS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            strokeWidth="1.21429"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                }
                label={'Training settings'}
                active={activeIndex === TrainingTab.SETTINGS}
                onClick={() => setActiveTab(TrainingTab.SETTINGS)}
            />

            <MenuElement
                icon={
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="sitemap">
                            <path
                                id="Vector"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13.25 9.75H14C14.4633 9.74738 14.9069 9.56216 15.2345 9.23454C15.5622 8.90691 15.7474 8.46332 15.75 8V5C15.7474 4.53668 15.5622 4.09309 15.2345 3.76546C14.9069 3.43784 14.4633 3.25263 14 3.25H11C10.5367 3.25263 10.0931 3.43784 9.76546 3.76546C9.43784 4.09309 9.25262 4.53668 9.25 5V8C9.25262 8.46332 9.43784 8.90691 9.76546 9.23454C10.0931 9.56216 10.5367 9.74738 11 9.75H11.75V11.25H6.5C6.03668 11.2526 5.59309 11.4378 5.26546 11.7655C4.93784 12.0931 4.75262 12.5367 4.75 13V14.25H4.5C4.03668 14.2526 3.59309 14.4378 3.26546 14.7655C2.93784 15.0931 2.75263 15.5367 2.75 16V18C2.75263 18.4633 2.93784 18.9069 3.26546 19.2345C3.59309 19.5622 4.03668 19.7474 4.5 19.75H6.5C6.96332 19.7474 7.40691 19.5622 7.73454 19.2345C8.06216 18.9069 8.24738 18.4633 8.25 18V16C8.24738 15.5367 8.06216 15.0931 7.73454 14.7655C7.40691 14.4378 6.96332 14.2526 6.5 14.25H6.25V13C6.25 12.9337 6.27634 12.8701 6.32322 12.8232C6.37011 12.7763 6.4337 12.75 6.5 12.75H11.75V14.25H11.5C11.0367 14.2526 10.5931 14.4378 10.2655 14.7655C9.93784 15.0931 9.75262 15.5367 9.75 16V18C9.75262 18.4633 9.93784 18.9069 10.2655 19.2345C10.5931 19.5622 11.0367 19.7474 11.5 19.75H13.5C13.9633 19.7474 14.4069 19.5622 14.7345 19.2345C15.0622 18.9069 15.2474 18.4633 15.25 18V16C15.2474 15.5367 15.0622 15.0931 14.7345 14.7655C14.4069 14.4378 13.9633 14.2526 13.5 14.25H13.25V12.75H18.5C18.5663 12.75 18.6299 12.7763 18.6768 12.8232C18.7237 12.8701 18.75 12.9337 18.75 13V14.25H18.5C18.0367 14.2526 17.5931 14.4378 17.2655 14.7655C16.9378 15.0931 16.7526 15.5367 16.75 16V18C16.7526 18.4633 16.9378 18.9069 17.2655 19.2345C17.5931 19.5622 18.0367 19.7474 18.5 19.75H20.5C20.9633 19.7474 21.4069 19.5622 21.7345 19.2345C22.0622 18.9069 22.2474 18.4633 22.25 18V16C22.2474 15.5367 22.0622 15.0931 21.7345 14.7655C21.4069 14.4378 20.9633 14.2526 20.5 14.25H20.25V13C20.2474 12.5367 20.0622 12.0931 19.7345 11.7655C19.4069 11.4378 18.9633 11.2526 18.5 11.25H13.25V9.75ZM12.5 8.25H14C14.0663 8.25 14.1299 8.22366 14.1768 8.17678C14.2237 8.12989 14.25 8.0663 14.25 8V5C14.25 4.9337 14.2237 4.87011 14.1768 4.82322C14.1299 4.77634 14.0663 4.75 14 4.75H11C10.9337 4.75 10.8701 4.77634 10.8232 4.82322C10.7763 4.87011 10.75 4.9337 10.75 5V8C10.75 8.0663 10.7763 8.12989 10.8232 8.17678C10.8701 8.22366 10.9337 8.25 11 8.25H12.5ZM12.5 15.75H11.5C11.4337 15.75 11.3701 15.7763 11.3232 15.8232C11.2763 15.8701 11.25 15.9337 11.25 16V18C11.25 18.0663 11.2763 18.1299 11.3232 18.1768C11.3701 18.2237 11.4337 18.25 11.5 18.25H13.5C13.5663 18.25 13.6299 18.2237 13.6768 18.1768C13.7237 18.1299 13.75 18.0663 13.75 18V16C13.75 15.9337 13.7237 15.8701 13.6768 15.8232C13.6299 15.7763 13.5663 15.75 13.5 15.75H12.5ZM18.5 15.75H19.5H20.5C20.5663 15.75 20.6299 15.7763 20.6768 15.8232C20.7237 15.8701 20.75 15.9337 20.75 16V18C20.75 18.0663 20.7237 18.1299 20.6768 18.1768C20.6299 18.2237 20.5663 18.25 20.5 18.25H18.5C18.4337 18.25 18.3701 18.2237 18.3232 18.1768C18.2763 18.1299 18.25 18.0663 18.25 18V16C18.25 15.9337 18.2763 15.8701 18.3232 15.8232C18.3701 15.7763 18.4337 15.75 18.5 15.75ZM4.5 15.75H5.5H6.5C6.5663 15.75 6.62989 15.7763 6.67678 15.8232C6.72366 15.8701 6.75 15.9337 6.75 16V18C6.75 18.0663 6.72366 18.1299 6.67678 18.1768C6.62989 18.2237 6.5663 18.25 6.5 18.25H4.5C4.4337 18.25 4.37011 18.2237 4.32322 18.1768C4.27634 18.1299 4.25 18.0663 4.25 18V16C4.25 15.9337 4.27634 15.8701 4.32322 15.8232C4.37011 15.7763 4.4337 15.75 4.5 15.75Z"
                                fill={activeIndex === TrainingTab.SCRIPTS ? 'var(--dark-800)' : 'var(--dark-200)'}
                            />
                        </g>
                    </svg>
                }
                label={'Training scripts'}
                active={activeIndex === TrainingTab.SCRIPTS}
                onClick={() => setActiveTab(TrainingTab.SCRIPTS)}
            />

            <div className={'relative'}>
                <div className={'w-full h-full flex  justify-center items-center absolute'}>
                    <span className={'text-[var(--primary)] '} style={{ fontSize: '12px' }}>
                        Comming soon!
                    </span>
                </div>
                <div className="flex flex-row gap-[14px] opacity-35">
                    <MenuElement
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="users">
                                    <path
                                        id="Vector"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M11.9166 11.618C12.5333 12.0301 13.2583 12.25 14 12.25C14.9946 12.25 15.9484 11.8549 16.6517 11.1517C17.3549 10.4484 17.75 9.49456 17.75 8.5C17.75 7.75832 17.5301 7.0333 17.118 6.41661C16.706 5.79993 16.1203 5.31928 15.4351 5.03545C14.7498 4.75162 13.9958 4.67736 13.2684 4.82206C12.541 4.96675 11.8728 5.3239 11.3484 5.84835C10.8239 6.3728 10.4668 7.04098 10.3221 7.76841C10.1774 8.49584 10.2516 9.24984 10.5355 9.93506C10.8193 10.6203 11.2999 11.206 11.9166 11.618ZM12.75 6.62919C13.12 6.38196 13.555 6.25 14 6.25C14.5967 6.25 15.169 6.48705 15.591 6.90901C16.0129 7.33097 16.25 7.90326 16.25 8.5C16.25 8.94501 16.118 9.38002 15.8708 9.75003C15.6236 10.12 15.2722 10.4084 14.861 10.5787C14.4499 10.749 13.9975 10.7936 13.561 10.7068C13.1246 10.62 12.7237 10.4057 12.409 10.091C12.0943 9.77632 11.8801 9.37541 11.7932 8.93895C11.7064 8.5025 11.751 8.0501 11.9213 7.63896C12.0916 7.22783 12.38 6.87643 12.75 6.62919ZM20.4725 19.0275C20.6126 19.1676 20.8019 19.2474 21 19.25C21.1981 19.2474 21.3874 19.1676 21.5275 19.0275C21.6676 18.8874 21.7474 18.6981 21.75 18.5C21.75 13.75 16.32 13.75 14 13.75C11.68 13.75 6.25 13.75 6.25 18.5C6.25 18.6989 6.32902 18.8897 6.46967 19.0303C6.61032 19.171 6.80109 19.25 7 19.25C7.19891 19.25 7.38968 19.171 7.53033 19.0303C7.67098 18.8897 7.75 18.6989 7.75 18.5C7.75 16.55 8.81 15.25 14 15.25C19.19 15.25 20.25 16.55 20.25 18.5C20.2526 18.6981 20.3324 18.8874 20.4725 19.0275ZM8.31999 13.06H7.99999C7.20434 12.9831 6.47184 12.5933 5.96361 11.9763C5.45539 11.3593 5.21308 10.5657 5.28999 9.77001C5.36691 8.97436 5.75674 8.24186 6.37373 7.73363C6.99073 7.22541 7.78434 6.9831 8.57999 7.06001C8.68201 7.0644 8.78206 7.08957 8.87401 7.13399C8.96596 7.1784 9.04787 7.24113 9.11472 7.31831C9.18157 7.3955 9.23196 7.48553 9.26279 7.58288C9.29362 7.68023 9.30425 7.78285 9.29402 7.88445C9.28379 7.98605 9.25292 8.08449 9.20331 8.17374C9.15369 8.26299 9.08637 8.34116 9.00548 8.40348C8.92458 8.46579 8.83181 8.51093 8.73286 8.53613C8.6339 8.56133 8.53084 8.56605 8.42999 8.55001C8.23479 8.53055 8.03766 8.55062 7.85038 8.60904C7.6631 8.66746 7.48952 8.76302 7.33999 8.89001C7.18812 9.01252 7.06216 9.16403 6.96945 9.33572C6.87673 9.50741 6.81913 9.69583 6.79999 9.89001C6.77932 10.0866 6.79797 10.2854 6.85488 10.4747C6.91178 10.6641 7.0058 10.8402 7.13144 10.9928C7.25709 11.1455 7.41186 11.2716 7.58673 11.3638C7.76159 11.456 7.95307 11.5125 8.14999 11.53C8.47553 11.5579 8.80144 11.4808 9.07999 11.31C9.24973 11.2053 9.45413 11.1722 9.64824 11.2182C9.84234 11.2641 10.0102 11.3853 10.115 11.555C10.2198 11.7248 10.2528 11.9292 10.2069 12.1233C10.1609 12.3174 10.0397 12.4853 9.86999 12.59C9.40619 12.8858 8.86998 13.0484 8.31999 13.06ZM2.47253 18.2775C2.61263 18.4176 2.80189 18.4974 3 18.5C3.19811 18.4974 3.38737 18.4176 3.52747 18.2775C3.66756 18.1374 3.74741 17.9481 3.75 17.75C3.75 15.5 4.15 14.75 6.5 14.75C6.69891 14.75 6.88968 14.671 7.03033 14.5303C7.17098 14.3897 7.25 14.1989 7.25 14C7.25 13.8011 7.17098 13.6103 7.03033 13.4697C6.88968 13.329 6.69891 13.25 6.5 13.25C2.97 13.25 2.25 15.05 2.25 17.75C2.25259 17.9481 2.33244 18.1374 2.47253 18.2775Z"
                                        fill={activeIndex === TrainingTab.PARTICIPANTS ? 'var(--dark-800)' : 'var(--dark-200)'}
                                    />
                                </g>
                            </svg>
                        }
                        label={'Participants'}
                        active={activeIndex === TrainingTab.PARTICIPANTS}
                        onClick={() => setActiveTab(TrainingTab.PARTICIPANTS)}
                        disabled={true}
                    />
                </div>
            </div>
        </div>
    )
    const endContent = (
        <div className={'relative'}>
            <div className={'w-full h-full flex  justify-center items-center absolute'}>
                <span className={'text-[var(--primary)] '} style={{ fontSize: '12px' }}>
                    Comming soon!
                </span>
            </div>
            <div className="flex flex-row gap-[14px] opacity-35">
                <MenuElementSecondary icon={PrimeIcons.UPLOAD} label={'Publish'} onClick={onClickPublishTraining} disabled={true} />
            </div>
        </div>
    )

    if (localTrainingData === null) return <InfinityLoader></InfinityLoader>

    return (
        <div className={'training'}>
            <Toolbar start={startContent} center={centerContent} end={endContent} />

            {activeIndex === TrainingTab.SETTINGS && <TrainingSettingsTabComponent></TrainingSettingsTabComponent>}
            {activeIndex === TrainingTab.SCRIPTS && <TrainingScriptsTabComponent></TrainingScriptsTabComponent>}
            {activeIndex === TrainingTab.PARTICIPANTS && <TrainingParticipantsTabComponent></TrainingParticipantsTabComponent>}
        </div>
    )
}
