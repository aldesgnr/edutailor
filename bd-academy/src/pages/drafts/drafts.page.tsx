import { FunctionComponent, useEffect, useRef, useState } from 'react'
import './drafts.css'
import { useNavigate } from 'react-router-dom'
import { TrainingCardComponent, TrainingCardComponentTypes, TrainingData } from '../../components/training/training-card.component'
import TrainingService from '../../services/training/training.service'
import { TrainingNotFoundComponent } from '../../components/training/training-notfound.component'
import { PrimeIcons } from 'primereact/api'
import { RoundedButton } from '../../components/common/round-button/round-button.components'

export const DraftsPage: FunctionComponent = () => {
    const [drafts, setDrafts] = useState<TrainingData[]>([])
    const navigate = useNavigate()
    const draftsContainer = useRef<HTMLDivElement>(null)
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
            setDrafts(d)
        })
    }

    const onClickChangeFavorite = (training: TrainingData) => {
        TrainingService.changeTrainingToFavorite({ trainingId: training.id, trainingCreatorId: '2013c774-01e7-47e6-81cf-15356c1885e1' }).then(() => {
            refreshTrainings()
        })
    }

    const onClickLeftDrafts = () => {
        if (draftsContainer.current) {
            let actualLeft = 0
            if (draftsContainer.current.style.left !== '') {
                actualLeft = parseFloat(draftsContainer.current.style.left.split('px')[0])
            }
            if (actualLeft === 0) return
            draftsContainer.current.style.left = (actualLeft + childWidth).toString() + 'px'
        }
    }
    const onClickRightDrafts = () => {
        if (draftsContainer.current) {
            let actualLeft = 0
            if (draftsContainer.current.style.left !== '') {
                actualLeft = parseFloat(draftsContainer.current.style.left.split('px')[0])
            }
            draftsContainer.current.style.left = (actualLeft - childWidth).toString() + 'px'
        }
    }

    return (
        <div className={'app-content drafts  flex h-full w-full flex flex-col  gap-5 '}>
            <div className={'flex flex-row justify-between'}>
                <h2>Drafts</h2>
                <div className={'flex flex-row gap-[2px]'}>
                    <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftDrafts}></RoundedButton>
                    <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightDrafts}></RoundedButton>
                </div>
            </div>
            <div className={'flex flex-row gap-[20px] relative  training-container'} ref={draftsContainer}>
                {drafts.length === 0 && (
                    <TrainingNotFoundComponent message={`The best place for unfinished projects. But you have to start one ...`} icon={PrimeIcons.PENCIL} />
                )}
                {drafts.map((training) => (
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
