import { FunctionComponent, useEffect, useRef, useState } from 'react'

import { PrimeIcons } from 'primereact/api'
import { Divider } from 'primereact/divider'
import { useNavigate } from 'react-router-dom'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { GlobalToast } from '../../services/gloabal-toast'
import { InputText } from 'primereact/inputtext'
import { HelpCardComponent } from '../../components/common/help-card/help-card.component'
import { RoundedButton } from '../../components/common/round-button/round-button.components'
import { TrainingCardComponent, TrainingCardComponentTypes, TrainingData } from '../../components/training/training-card.component'
import TrainingService from '../../services/training/training.service'
import './dashboard.page.css'
import { TrainingNotFoundComponent } from '../../components/training/training-notfound.component'
export enum Labels {
    SCENE = 'Scene',
    SCRIPT = 'Script',
    QUIZ = 'Quiz',
    READING = 'Reading',
}
export type DashboardPageProps = {}
export const DashboardPage: FunctionComponent<DashboardPageProps> = () => {
    const draftsContainer = useRef<HTMLDivElement>(null)
    const favoritesContainer = useRef<HTMLDivElement>(null)
    const childWidth = 335
    const [newTrainingCards] = useState([
        {
            title: 'VR Training',
            id: '737f3e7b-212d-4d9a-b0e8-788ca198eb53',
            description: 'Prepare the training scene, develop a scenario and test it in VR',
            type: 'VR',
        },
        {
            title: 'Scene',
            id: 'd805f29c-06a7-4ea6-9954-020a8e0d5753',
            description: 'Prepare the training scene',
            type: 'SCENE',
        },
        {
            title: 'Quiz',
            id: 'd805f49c-06a7-4ea6-9954-020a8e0d5753',
            description: 'Configure knowledge test',
            type: 'QUIZ',
        },
    ])
    const [trainings, setTrainings] = useState<TrainingData[]>([])
    const [drafts, setDrafts] = useState<TrainingData[]>([])
    const [favorites, setFavorites] = useState<TrainingData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const onClickNewTraining = (training: TrainingData) => {
        navigate(`/trainings/new?trainingType=${training.type}`)
    }
    const onClickEditTraining = (training: TrainingData) => {
        navigate(`/trainings/edit?trainingUUID=${training.id}`)
    }

    const refreshTrainings = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await TrainingService.getTrainings()
            const t = [...response.data]
            setTrainings(t)
            const d = [...response.data.filter((training: TrainingData) => training.type === 'DRAFT')]
            setDrafts(d)
            const f = [...response.data.filter((training: TrainingData) => training.favorite === true)]
            setFavorites(f)
        } catch (err) {
            const errorMsg = 'Failed to load trainings. Please try again.'
            setError(errorMsg)
            GlobalToast.toastShow?.('Error', errorMsg, 'error')
            console.error('[Dashboard] Error loading trainings:', err)
        } finally {
            setLoading(false)
        }
    }

    const onClickChangeFavorite = async (training: TrainingData) => {
        try {
            await TrainingService.changeTrainingToFavorite({ trainingId: training.id, trainingCreatorId: '2013c774-01e7-47e6-81cf-15356c1885e1' })
            await refreshTrainings()
            GlobalToast.toastShow?.('Success', 'Favorite updated', 'success')
        } catch (err) {
            GlobalToast.toastShow?.('Error', 'Failed to update favorite', 'error')
            console.error('[Dashboard] Error updating favorite:', err)
        }
    }
    const onClickEditDraft = (draft: TrainingData) => {
        navigate(`/trainings/edit?trainingUUID=${draft.id}`)
    }

    useEffect(() => {
        refreshTrainings()
    }, [])

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

    // Filter trainings by search term
    const filteredFavorites = favorites.filter(t => 
        searchTerm === '' ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredDrafts = drafts.filter(t => 
        searchTerm === '' ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return (
        <div className="app-content dashboard flex h-full w-full flex-col gap-[32px]">
            {error && (
                <Message severity="error" text={error} className="mb-4" />
            )}
            
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <ProgressSpinner />
                </div>
            )}
            
            {!loading && (
            <>
            <div className={'flex flex-col gap-[20px]'}>
                <h2>Create new</h2>
                <div className={'flex flex-row gap-[20px]'}>
                    {newTrainingCards &&
                        newTrainingCards.map((training) => (
                            <TrainingCardComponent
                                key={training.id}
                                type={TrainingCardComponentTypes.NEW}
                                trainingData={training as any}
                                onClick={() => onClickNewTraining(training as any)}
                            />
                        ))}
                    <HelpCardComponent />
                </div>
            </div>
            <Divider
                type="solid"
                pt={{
                    root: {
                        classtitle: 'm-[40px_0px]',
                    },
                }}
            />
            <div className={'flex flex-col gap-[20px]'}>
                <div className={'flex flex-row justify-between items-center'}>
                    <h2>Favorites</h2>
                    <div className={'flex flex-row gap-3 items-center'}>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-48"
                            />
                        </span>
                        <div className={'flex flex-row gap-[2px]'}>
                            <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftFavorites}></RoundedButton>
                            <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightFavorites}></RoundedButton>
                        </div>
                    </div>
                </div>
                <div className={'flex flex-row gap-[20px] overflow-x-hidden overflow-y-hidden '} ref={favoritesContainer}>
                    {filteredFavorites.length === 0 && (
                        <TrainingNotFoundComponent
                            message={searchTerm ? `No favorites found matching "${searchTerm}"` : `It looks like you don't like anyone yet. Click the heart to add file to your favorites`}
                            icon={PrimeIcons.HEART}
                        />
                    )}
                    {filteredFavorites.map((training) => (
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
            <Divider
                type="solid"
                pt={{
                    root: {
                        classtitle: 'm-[40px_0px]',
                    },
                }}
            />
            <div className={'flex flex-col gap-[20px]'}>
                <div className={'flex flex-row justify-between'}>
                    <h2>Drafts</h2>
                    <div className={'flex flex-row gap-[2px]'}>
                        <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftDrafts}></RoundedButton>
                        <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightDrafts}></RoundedButton>
                    </div>
                </div>
                <div className={'flex flex-row gap-[20px] relative  training-container'} ref={draftsContainer}>
                    {filteredDrafts.length === 0 && (
                        <TrainingNotFoundComponent 
                            message={searchTerm ? `No drafts found matching "${searchTerm}"` : `The best place for unfinished projects. But you have to start one ...`} 
                            icon={PrimeIcons.PENCIL} 
                        />
                    )}
                    {filteredDrafts.map((draft) => (
                        <TrainingCardComponent
                            key={draft.id}
                            type={TrainingCardComponentTypes.TRAINING}
                            trainingData={draft}
                            onClick={() => onClickEditDraft(draft)}
                            onClickChangeFavorite={() => onClickChangeFavorite(draft)}
                        />
                    ))}
                </div>
            </div>
            </>
            )}
        </div>
    )
}
