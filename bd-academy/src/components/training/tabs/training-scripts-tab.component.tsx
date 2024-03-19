import { FunctionComponent, useContext, useEffect, useState } from 'react'
import '../training.css'

import 'primeicons/primeicons.css' //icons
import { PrimeIcons } from 'primereact/api'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import 'primereact/resources/primereact.min.css' //core css
import { useLocation, useNavigate } from 'react-router-dom'
import { TrainingContext } from '../../../contexts/training-context'
import { uuidv4 } from '../../../services/training/training.service'
import { PrimaryButton } from '../../common/primary-button/primary-button'
import { SecondaryButton } from '../../common/secondary-button/secondary-button'
import { ScriptSectionComponent, TrainingScriptSection } from '../../script/script-section'
import { TrainingData } from '../training-card.component'
import { GlobalToast } from '../../../services/gloabal-toast'
export const TrainingScriptsTabComponent: FunctionComponent = () => {
    const { trainingData, updateTrainingData } = useContext(TrainingContext)
    const [localTrainingData, setLocalTrainingData] = useState<TrainingData | null>(null)

    const navigate = useNavigate()
    const location = useLocation()
    const [trainingUUID, setTrainingUUID] = useState<string | null>(null)
    const [trainingSections, setTrainingSections] = useState<TrainingScriptSection[]>([])
    const [newSection, setNewSection] = useState<TrainingScriptSection | null>(null)

    useEffect(() => {
        setLocalTrainingData(trainingData)
    }, [trainingData])

    useEffect(() => {
        if (!trainingData) return
        setTrainingSections(trainingData.trainingSections)
    }, [])

    useEffect(() => {
        if (trainingData) {
            const trainingDataT = { ...trainingData }
            trainingDataT.trainingSections = trainingSections
            updateTrainingData(trainingDataT, true, false)
        }
    }, [trainingSections])

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const tUUID = searchParams.get('trainingUUID')
        setTrainingUUID(tUUID || null)
    }, [location])

    const onClickShowNewSectionInput = () => {
        const newSectionT: TrainingScriptSection = {
            id: uuidv4(),
            title: '',
            trainingSectionComponents: [],
        }
        setNewSection(newSectionT)
    }
    const onClickCancelNewSection = () => {
        setNewSection(null)
    }
    const onClickAddNewSection = () => {
        if (!newSection) return
        const sectionsT = [...trainingSections]
        sectionsT.push(newSection)

        setNewSection(null)
        setTrainingSections(sectionsT)
    }
    const updateNewSectionTitle = (title: string) => {
        if (!newSection) return console.log('newSection is null')
        const newSectionT = { ...newSection }
        newSectionT.title = title
        setNewSection(newSectionT)
    }

    const onClickSaveTrainingData = () => {
        updateTrainingData(trainingData, true, true).then(() => {
            GlobalToast.toastShow?.('Success', 'Training was updated', 'success')
            navigate(`/trainings/edit?trainingUUID=${trainingUUID}`)
        })
    }

    const onClickEdit = (scriptSection: TrainingScriptSection) => {}
    const onClickDelete = (scriptSection: TrainingScriptSection) => {
        const trainingSectionsT = [...trainingSections].filter((sc) => sc.id !== scriptSection.id)
        setTrainingSections(trainingSectionsT)
    }

    return (
        <div className={' training-scripts flex flex-col justify-start r gap-[24px]  h-[calc(100%-65px)] relative'}>
            <div className={'flex flex-row justify-start items-center gap-[24px] '}>
                <h1 className={'text-[24px] leading-[26px] text-[700] '}>Sections</h1>
                <SecondaryButton label={'Add a new section'} icon={PrimeIcons.PLUS} onClick={onClickShowNewSectionInput}></SecondaryButton>
            </div>
            <div className={'flex flex-col overflow-y-auto h-full pr-1  gap-[24px]'}>
                {localTrainingData?.trainingSections.map((section, idx) => {
                    return (
                        <ScriptSectionComponent
                            key={section.id}
                            number={idx + 1}
                            scriptSection={section}
                            onClickEdit={() => onClickEdit(section)}
                            onClickDelete={() => onClickDelete(section)}
                        ></ScriptSectionComponent>
                    )
                })}
                {newSection && (
                    <div className={'flex flex-col  gap-[24px] max-w-[600px]'}>
                        <div>
                            <label htmlFor="title">Title*</label>
                            <InputText
                                value={newSection?.title}
                                id="title"
                                title="Training title"
                                type="text"
                                required
                                onChange={(e) => updateNewSectionTitle(e.target.value)}
                            ></InputText>
                        </div>
                        <div className={'flex flex-row justify-end items-center gap-[24px] '}>
                            <SecondaryButton label={'Cancel'} icon={PrimeIcons.TIMES} onClick={onClickCancelNewSection}></SecondaryButton>
                            <PrimaryButton label={'Create section'} onClick={onClickAddNewSection}></PrimaryButton>
                        </div>
                    </div>
                )}

                <Divider property="xd"></Divider>
                <div className={'flex flex-row justify-end '}>
                    <PrimaryButton label="Save" onClick={() => onClickSaveTrainingData()}></PrimaryButton>
                </div>
            </div>
        </div>
    )
}
