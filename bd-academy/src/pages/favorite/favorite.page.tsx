import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrainingCardComponent, TrainingCardComponentTypes, TrainingData } from '../../components/training/training-card.component'
import './favorite.css'
import TrainingService from '../../services/training/training.service'
import { TrainingNotFoundComponent } from '../../components/training/training-notfound.component'
import { PrimeIcons } from 'primereact/api'
import { RoundedButton } from '../../components/common/round-button/round-button.components'

export const FavoritePage: FunctionComponent = () => {
    const [favorites, setFavorites] = useState<TrainingData[]>([])
    const favoritesContainer = useRef<HTMLDivElement>(null)
    const childWidth = 335
    const navigate = useNavigate()

    const onClickEditTraining = (training: TrainingData) => {
        navigate(`/trainings/edit?trainingUUID=${training.id}`)
    }

    useEffect(() => {
        refreshTrainings()
    }, [])

    const refreshTrainings = () => {
        TrainingService.getTrainings().then((response) => {
            const d = [...response.data.filter((training: TrainingData) => training.favorite === true)]
            setFavorites(d)
        })
    }

    const onClickChangeFavorite = (training: TrainingData) => {
        TrainingService.changeTrainingToFavorite({ trainingId: training.id, trainingCreatorId: '2013c774-01e7-47e6-81cf-15356c1885e1' }).then(() => {
            refreshTrainings()
        })
    }
    const onClickLeftFavorites = () => {
        if (favoritesContainer.current) {
            let actualLeft = 0
            if (favoritesContainer.current.style.left !== '') {
                actualLeft = parseFloat(favoritesContainer.current.style.left.split('px')[0])
            }
            if (actualLeft === 0) return
            favoritesContainer.current.style.left = (actualLeft + childWidth).toString() + 'px'
        }
    }
    const onClickRightFavorites = () => {
        if (favoritesContainer.current) {
            let actualLeft = 0
            if (favoritesContainer.current.style.left !== '') {
                actualLeft = parseFloat(favoritesContainer.current.style.left.split('px')[0])
            }
            favoritesContainer.current.style.left = (actualLeft - childWidth).toString() + 'px'
        }
    }

    return (
        <div className={' app-content favorite  flex h-full w-full flex flex-col  gap-5 '}>
            <div className={'flex flex-row justify-between'}>
                <h2>Favorites</h2>
                <div className={'flex flex-row gap-[2px]'}>
                    <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftFavorites}></RoundedButton>
                    <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightFavorites}></RoundedButton>
                </div>
            </div>

            <div className={'flex flex-row gap-[20px] relative  training-container'} ref={favoritesContainer}>
                {favorites.length === 0 && (
                    <TrainingNotFoundComponent
                        message={`It looks like you don't like anyone yet. Click the heart to add file to your favorites`}
                        icon={PrimeIcons.HEART}
                    />
                )}
                {favorites.map((training) => (
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
