import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TrainingCardComponent, TrainingCardComponentTypes, TrainingData } from '../../components/training/training-card.component'
import TrainingService from '../../services/training/training.service'
import './training.page.css'
import { TrainingNotFoundComponent } from '../../components/training/training-notfound.component'
import { PrimeIcons } from 'primereact/api'
import { RoundedButton } from '../../components/common/round-button/round-button.components'

export const TrainingPage: FunctionComponent = () => {
    const [trainings, setTrainings] = useState<TrainingData[]>([])
    const navigate = useNavigate()
    const trainingsContainer = useRef<HTMLDivElement>(null)
    const childWidth = 335

    const onClickEditTraining = (training: any) => {
        navigate(`/trainings/edit?trainingUUID=${training.id}`)
    }

    useEffect(() => {
        refreshTrainings()
    }, [])

    const refreshTrainings = () => {
        TrainingService.getTrainings().then((response) => {
            const d = [...response.data.filter((training: TrainingData) => training.type === 'DRAFT')]
            setTrainings(d)
        })
    }

    const onClickChangeFavorite = (training: TrainingData) => {
        TrainingService.changeTrainingToFavorite({ trainingId: training.id, trainingCreatorId: '2013c774-01e7-47e6-81cf-15356c1885e1' }).then((response) => {
            refreshTrainings()
        })
    }
    const onClickLeftTrainings = () => {
        if (trainingsContainer.current) {
            let actualLeft = 0
            if (trainingsContainer.current.style.left !== '') {
                actualLeft = parseFloat(trainingsContainer.current.style.left.split('px')[0])
            }
            if (actualLeft === 0) return
            trainingsContainer.current.style.left = (actualLeft + childWidth).toString() + 'px'
        }
    }
    const onClickRightTrainings = () => {
        if (trainingsContainer.current) {
            let actualLeft = 0
            if (trainingsContainer.current.style.left !== '') {
                actualLeft = parseFloat(trainingsContainer.current.style.left.split('px')[0])
            }
            trainingsContainer.current.style.left = (actualLeft - childWidth).toString() + 'px'
        }
    }

    return (
        <div className={'app-content training  flex h-full w-full flex flex-col  gap-5  '}>
            <div className={'flex flex-row justify-between'}>
                <h2>Trainings</h2>
                <div className={'flex flex-row gap-[2px]'}>
                    <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftTrainings}></RoundedButton>
                    <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightTrainings}></RoundedButton>
                </div>
            </div>
            <div className={'flex flex-row gap-[20px] relative  training-container'} ref={trainingsContainer}>
                {trainings.length === 0 && (
                    <TrainingNotFoundComponent message={`The best place for unfinished projects. But you have to start one ...`} icon={PrimeIcons.PENCIL} />
                )}
                {trainings.map((training) => (
                    <TrainingCardComponent
                        key={training.id}
                        type={TrainingCardComponentTypes.TRAINING}
                        trainingData={training}
                        onClick={() => onClickEditTraining(training)}
                        onClickChangeFavorite={() => onClickChangeFavorite(training)}
                    />
                ))}
            </div>
        </div>
    )
}
