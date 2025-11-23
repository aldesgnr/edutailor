import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TrainingCardComponent, TrainingCardComponentTypes, TrainingData } from '../../components/training/training-card.component'
import TrainingService from '../../services/training/training.service'
import './training.page.css'
import { TrainingNotFoundComponent } from '../../components/training/training-notfound.component'
import { PrimeIcons } from 'primereact/api'
import { RoundedButton } from '../../components/common/round-button/round-button.components'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Tooltip } from 'primereact/tooltip'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { GlobalToast } from '../../services/gloabal-toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

export const TrainingPage: FunctionComponent = () => {
    const [trainings, setTrainings] = useState<TrainingData[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')
    const [selectedTrainings, setSelectedTrainings] = useState<Set<string>>(new Set())
    const [bulkMode, setBulkMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const trainingsContainer = useRef<HTMLDivElement>(null)
    const childWidth = 335

    const onClickEditTraining = (training: any) => {
        if (bulkMode) {
            toggleTrainingSelection(training.id)
        } else {
            navigate(`/trainings/edit?trainingUUID=${training.id}`)
        }
    }

    const toggleTrainingSelection = (id: string) => {
        const newSelected = new Set(selectedTrainings)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedTrainings(newSelected)
    }

    const selectAll = () => {
        const allIds = new Set(filteredTrainings.map(t => t.id))
        setSelectedTrainings(allIds)
    }

    const deselectAll = () => {
        setSelectedTrainings(new Set())
    }

    const bulkDelete = () => {
        if (selectedTrainings.size === 0) return
        
        confirmDialog({
            message: `Are you sure you want to delete ${selectedTrainings.size} training(s)? This action cannot be undone.`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    // Delete each selected training
                    const deletePromises = Array.from(selectedTrainings).map(id => 
                        fetch(`http://localhost:5007/api/Trainings/${id}`, { method: 'DELETE' })
                    )
                    await Promise.all(deletePromises)
                    
                    GlobalToast.toastShow?.('Success', `${selectedTrainings.size} training(s) deleted`, 'success')
                    setSelectedTrainings(new Set())
                    setBulkMode(false)
                    await refreshTrainings()
                } catch (error) {
                    GlobalToast.toastShow?.('Error', 'Failed to delete trainings', 'error')
                    console.error('[Training] Error deleting trainings:', error)
                }
            }
        })
    }

    useEffect(() => {
        refreshTrainings()
    }, [])

    const refreshTrainings = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await TrainingService.getTrainings()
            setTrainings(response.data)
        } catch (err) {
            const errorMsg = 'Failed to load trainings. Please try again.'
            setError(errorMsg)
            GlobalToast.toastShow?.('Error', errorMsg, 'error')
            console.error('[Training] Error loading trainings:', err)
        } finally {
            setLoading(false)
        }
    }

    // Filter trainings based on search and status
    const filteredTrainings = trainings.filter((training) => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            training.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            training.description?.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Status filter
        const matchesStatus = filterStatus === 'ALL' || 
            (filterStatus === 'DRAFT' && training.type === 'DRAFT') ||
            (filterStatus === 'PUBLISHED' && training.published)
        
        return matchesSearch && matchesStatus
    })

    const onClickChangeFavorite = async (training: TrainingData) => {
        try {
            await TrainingService.changeTrainingToFavorite({ trainingId: training.id, trainingCreatorId: '2013c774-01e7-47e6-81cf-15356c1885e1' })
            await refreshTrainings()
            GlobalToast.toastShow?.('Success', 'Favorite updated', 'success')
        } catch (err) {
            GlobalToast.toastShow?.('Error', 'Failed to update favorite', 'error')
            console.error('[Training] Error updating favorite:', err)
        }
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

    const statusOptions = [
        { label: 'All Trainings', value: 'ALL' },
        { label: 'Drafts', value: 'DRAFT' },
        { label: 'Published', value: 'PUBLISHED' }
    ]

    return (
        <div className={'app-content training flex h-full w-full flex-col gap-5'}>
            {/* Confirm Dialog */}
            <ConfirmDialog />
            
            {/* Tooltips */}
            <Tooltip target=".search-input" content="Search by training title or description" position="bottom" />
            <Tooltip target=".filter-dropdown" content="Filter trainings by status (All/Draft/Published)" position="bottom" />
            <Tooltip target=".bulk-mode-btn" content="Enable multi-select mode" position="bottom" />
            <Tooltip target=".select-all-btn" content="Select all visible trainings" position="bottom" />
            <Tooltip target=".deselect-all-btn" content="Deselect all trainings" position="bottom" />
            <Tooltip target=".bulk-delete-btn" content="Delete selected trainings" position="bottom" />
            
            <div className={'flex flex-row justify-between items-center'}>
                <h2>Trainings</h2>
                <div className={'flex flex-row gap-3 items-center'}>
                    {/* Search */}
                    <span className="p-input-icon-left search-input">
                        <i className="pi pi-search" />
                        <InputText 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search trainings..."
                            className="w-64"
                        />
                    </span>
                    
                    {/* Status Filter */}
                    <Dropdown 
                        value={filterStatus}
                        options={statusOptions}
                        onChange={(e) => setFilterStatus(e.value)}
                        placeholder="Filter by status"
                        className="w-48 filter-dropdown"
                    />
                    
                    {/* Bulk Operations */}
                    {!bulkMode ? (
                        <Button 
                            icon="pi pi-check-square"
                            label="Select"
                            onClick={() => setBulkMode(true)}
                            className="bulk-mode-btn"
                            outlined
                        />
                    ) : (
                        <>
                            <Button 
                                icon="pi pi-check"
                                label="All"
                                onClick={selectAll}
                                className="select-all-btn"
                                size="small"
                                outlined
                            />
                            <Button 
                                icon="pi pi-times"
                                label="None"
                                onClick={deselectAll}
                                className="deselect-all-btn"
                                size="small"
                                outlined
                            />
                            <Button 
                                icon="pi pi-trash"
                                label={`Delete (${selectedTrainings.size})`}
                                onClick={bulkDelete}
                                className="bulk-delete-btn"
                                severity="danger"
                                size="small"
                                disabled={selectedTrainings.size === 0}
                            />
                            <Button 
                                icon="pi pi-times"
                                label="Cancel"
                                onClick={() => {
                                    setBulkMode(false)
                                    setSelectedTrainings(new Set())
                                }}
                                size="small"
                                text
                            />
                        </>
                    )}
                    
                    {/* Navigation arrows */}
                    <div className={'flex flex-row gap-[2px]'}>
                        <RoundedButton icon={PrimeIcons.ARROW_LEFT} size="large" onClick={onClickLeftTrainings}></RoundedButton>
                        <RoundedButton icon={PrimeIcons.ARROW_RIGHT} size="large" onClick={onClickRightTrainings}></RoundedButton>
                    </div>
                </div>
            </div>
            {/* Error message */}
            {error && (
                <Message severity="error" text={error} className="mb-4" />
            )}
            
            {/* Loading spinner */}
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <ProgressSpinner />
                </div>
            )}
            
            {/* Results count */}
            {!loading && (
                <div className="text-sm text-gray-500">
                    Showing {filteredTrainings.length} of {trainings.length} trainings
                </div>
            )}
            
            {!loading && (
            <div className={'flex flex-row gap-[20px] relative  training-container'} ref={trainingsContainer}>
                {filteredTrainings.length === 0 && (
                    <TrainingNotFoundComponent 
                        message={searchTerm ? `No trainings found matching "${searchTerm}"` : `The best place for unfinished projects. But you have to start one ...`} 
                        icon={PrimeIcons.PENCIL} 
                    />
                )}
                {filteredTrainings.map((training) => (
                    <div key={training.id} className="relative">
                        {bulkMode && (
                            <div className="absolute top-2 left-2 z-10">
                                <Checkbox 
                                    checked={selectedTrainings.has(training.id)}
                                    onChange={() => toggleTrainingSelection(training.id)}
                                    className="bg-white rounded shadow-lg"
                                />
                            </div>
                        )}
                        <div className={bulkMode && selectedTrainings.has(training.id) ? 'ring-4 ring-blue-500 rounded-lg' : ''}>
                            <TrainingCardComponent
                                type={TrainingCardComponentTypes.TRAINING}
                                trainingData={training}
                                onClick={() => onClickEditTraining(training)}
                                onClickChangeFavorite={() => onClickChangeFavorite(training)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    )
}
