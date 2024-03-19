import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { TrainingData } from '../training-card.component'
import '../training.css'

import moment from 'moment'
import 'primeicons/primeicons.css' //icons
import { PrimeIcons } from 'primereact/api'
import { Calendar } from 'primereact/calendar'
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import 'primereact/resources/primereact.min.css' //core css
import { TabPanel, TabView } from 'primereact/tabview'
import { Nullable } from 'primereact/ts-helpers'
import { classNames } from 'primereact/utils'
import { Controller, useForm } from 'react-hook-form'
import { TrainingContext } from '../../../contexts/training-context'
import { PrimaryButton } from '../../common/primary-button/primary-button'
import { SecondaryButton } from '../../common/secondary-button/secondary-button'
import { GlobalToast } from '../../../services/gloabal-toast'
import { useNavigate } from 'react-router-dom'

export type TrainingDataFormFields = {
    title: string
    description: string
    trainingValue: string[]
}

export interface TrainingSettingsTabProps {}
export const TrainingSettingsTabComponent: FunctionComponent<TrainingSettingsTabProps> = () => {
    const { trainingData, updateTrainingData } = useContext(TrainingContext)

    const [localTrainingData, setLocalTrainingData] = useState<TrainingData | null>(null)
    const [trainingValues, setTrainingValues] = useState<string[]>([])
    const navigate = useNavigate()
    const [durationTimeDate, setDurationTimeDate] = useState<Date>(
        moment()
            .startOf('day')
            .add(trainingData?.durationTime || 0, 'minutes')
            .toDate(),
    )
    const [availableUntilDate, setAvailableUntilDate] = useState<Date>(
        trainingData?.availableUntil ? moment(trainingData?.availableUntil).toDate() : moment().toDate(),
    )

    useEffect(() => {
        if (!trainingData) return
        if (trainingValues.length === 0) return
        setTrainingValues([...trainingValues, ...trainingData.trainingValue])
    }, [])

    useEffect(() => {
        if (localTrainingData === null) return
        Object.keys(localTrainingData || {}).forEach((key) => {
            if (key === 'title' || key === 'description') setValue(key, localTrainingData[key])
        })
    }, [localTrainingData])

    useEffect(() => {
        setLocalTrainingData(trainingData)
        if (trainingData) {
            setTrainingValues([...trainingData.trainingValue])
        } else {
            setTrainingValues([])
        }
    }, [trainingData])

    const setTrainingValue = (index: number, value: string) => {
        if (!trainingData) return
        const trainingValuesCopy = [...trainingData.trainingValue]
        trainingValuesCopy[index] = value
        const trainingDataT = { ...trainingData } as TrainingData
        trainingDataT.trainingValue = [...trainingValuesCopy]
        updateTrainingData(trainingDataT as TrainingData, true, false)
    }

    const onClickAddNewTrainigValue = () => {
        if (!trainingData) return
        const trainingValuesCopy = [...trainingData.trainingValue]
        const trainingDataT = { ...trainingData } as TrainingData
        const empty = trainingValuesCopy.filter((value) => value === '')
        if (empty.length === 1) {
            return GlobalToast.toastShow?.('Error', 'Please fill the previous field', 'error')
        }
        trainingDataT.trainingValue = [...trainingValuesCopy, '']
        updateTrainingData(trainingDataT as TrainingData, true, false)
    }
    const onClickRemoveTrainigValue = (index: number) => {
        if (!trainingData) return
        const trainingValuesCopy = [...trainingData.trainingValue]
        const trainingDataT = { ...trainingData } as TrainingData
        trainingValuesCopy.splice(index, 1)
        trainingDataT.trainingValue = [...trainingValuesCopy]
        updateTrainingData(trainingDataT as TrainingData, true, false)
    }
    const onAvailableAlwaysChange = (e: CheckboxChangeEvent) => {
        const trainingDataCopy = { ...trainingData }
        if (e.checked === true) {
            trainingDataCopy.availableUntil = null
        } else {
            trainingDataCopy.availableUntil = moment(availableUntilDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        }
        updateTrainingData(trainingDataCopy as TrainingData, true, false)
    }
    const onAvailableUntilChange = (e: Nullable<Date>) => {
        const trainingDataCopy = { ...trainingData }
        trainingDataCopy.availableUntil = moment(e).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        updateTrainingData(trainingDataCopy as TrainingData, true, false)
        setAvailableUntilDate(moment(e).toDate())
    }
    const onDurationTimeChange = (e: Nullable<Date>) => {
        const durationTimeDate = moment(e)
        const startOfDate = durationTimeDate.clone().startOf('day')
        const minutes = durationTimeDate.diff(startOfDate, 'minutes')
        const trainingDataCopy = { ...trainingData }
        trainingDataCopy.durationTime = minutes
        updateTrainingData(trainingDataCopy as TrainingData, true, false)
        setDurationTimeDate(durationTimeDate.clone().startOf('day').add(minutes, 'minutes').toDate())
    }

    type ControlledInputDef = {
        title: string
        description: string
    }

    const {
        control,
        formState: { errors },
        handleSubmit,
        setValue,
        // getValues,
        // reset,
    } = useForm<ControlledInputDef>({ defaultValues: { title: '', description: '' } })

    const onClickSaveTrainingData = () => {
        const trainingDataCopy = { ...trainingData } as TrainingData
        if (trainingDataCopy) {
            trainingDataCopy.trainingValue = [...trainingDataCopy.trainingValue.filter((value) => value !== '')]
        }
        updateTrainingData(trainingDataCopy, true, true)
            .then(() => {
                GlobalToast.toastShow?.('Success', 'Training was updated', 'success')
                navigate(`/trainings/edit?trainingUUID=${trainingDataCopy.id}`)
            })
            .catch((error) => {
                GlobalToast.toastShow?.('Error', error.message, 'error')
            })
    }
    const onClickUpdateTrainingDataLocaly = (d: ControlledInputDef) => {
        if (!localTrainingData) return
        const trainingDataCopy = { ...localTrainingData } as TrainingData
        Object.assign(trainingDataCopy, d)
        updateTrainingData(trainingDataCopy, true, false)
            .then(() => {})
            .catch(() => {})
    }

    const getFormErrorMessage = (name: string) => {
        if (name === 'title' || name === 'description') return errors[name] ? <small className="p-error">{errors[name]?.message}</small> : <></>
        else return <></>
    }

    return (
        <div className={'training-settings'}>
            <TabView>
                <TabPanel header="About">
                    <div className=" flex justify-start flex-col pt-[14px] gap-[24px] max-w-[660px] w-full">
                        <form
                            onSubmit={handleSubmit(onClickSaveTrainingData)}
                            onChange={handleSubmit(onClickUpdateTrainingDataLocaly)}
                            className="flex flex-col gap-[24px]"
                        >
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: 'Title is required' }}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor={field.name} className={classNames({ 'p-error': errors.title })}>
                                            Training title*
                                        </label>
                                        <InputText
                                            value={field.value}
                                            id={field.name}
                                            required
                                            className={classNames({ 'p-invalid': fieldState.error })}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                            }}
                                        ></InputText>

                                        {getFormErrorMessage(field.name)}
                                    </div>
                                )}
                            />
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Description is required' }}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor={field.name} className={classNames({ 'p-error': errors.title })}>
                                            Training description*
                                        </label>
                                        <InputTextarea
                                            id={field.name}
                                            title="Training description"
                                            required
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                            }}
                                            rows={5}
                                            value={field.value}
                                            className={classNames({ 'p-invalid': fieldState.error })}
                                        ></InputTextarea>

                                        <small id="description-help">The description should be at least 200 words.</small>
                                        {getFormErrorMessage(field.name)}
                                    </div>
                                )}
                            />
                        </form>
                        <div>
                            <label htmlFor="trainingValue">What will participants learn?</label>
                            <div className={'flex flex-col gap-[24px]'}>
                                {trainingValues.length === 0 && (
                                    <p className="p-input-icon-right " key={'training_value' + 0}>
                                        <InputText
                                            id="trainingValue"
                                            title="What will participants learn?"
                                            // required
                                            onChange={(e) => setTrainingValue(0, e.target.value)}
                                        ></InputText>
                                    </p>
                                )}
                                {trainingValues.map((value, index) => (
                                    <p className="p-input-icon-right " key={'training_value' + index}>
                                        {value !== '' && (
                                            <i
                                                className={PrimeIcons.TRASH + ' cursor-pointer hover:text-[var(--danger)]'}
                                                onClick={() => onClickRemoveTrainigValue(index)}
                                            />
                                        )}
                                        <InputText
                                            id="trainingValue"
                                            title="What will participants learn?"
                                            required
                                            value={value}
                                            onChange={(e) => setTrainingValue(index, e.target.value)}
                                        ></InputText>
                                    </p>
                                ))}
                            </div>

                            <br />
                            <SecondaryButton label={'Add new'} outlined onClick={() => onClickAddNewTrainigValue()} />
                        </div>

                        <Divider></Divider>
                        <p>*Required fields</p>
                        <div className={'flex flex-row justify-end'}>
                            <PrimaryButton label="Save" onClick={onClickSaveTrainingData}></PrimaryButton>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Features">
                    <div className=" flex justify-start flex-col pt-[14px] gap-[24px]    max-w-[370px]">
                        <div className={'flex flex-col gap-[14px] '}>
                            <label htmlFor="durationTime">Approximate duration time</label>
                            <Calendar id="durationTime" value={durationTimeDate} onChange={(e) => onDurationTimeChange(e.value)} inline timeOnly />
                        </div>
                        <div className={'flex flex-col gap-[14px] '}>
                            <label htmlFor="availableUntil">Available until</label>
                            <div>
                                <Checkbox
                                    inputId="availableAlways"
                                    name="availableAlways"
                                    onChange={(e) => onAvailableAlwaysChange(e)}
                                    checked={localTrainingData?.availableUntil === null}
                                />
                                <label htmlFor="availableAlways" className="ml-2">
                                    Always available
                                </label>
                            </div>
                            {localTrainingData?.availableUntil !== null && (
                                <Calendar
                                    disabled={localTrainingData?.availableUntil === null ? true : false}
                                    value={availableUntilDate}
                                    onChange={(e) => onAvailableUntilChange(e.value)}
                                    inline
                                />
                            )}
                        </div>
                        <Divider property="xd"></Divider>
                        <div className={'flex flex-row justify-end '}>
                            <PrimaryButton label="Save" onClick={() => onClickSaveTrainingData()}></PrimaryButton>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    )
}
