import React, { ReactElement, createContext, useCallback, useMemo, useState } from 'react'
import { TrainingData } from '../components/training/training-card.component'
import TrainingService from '../services/training/training.service'
import { TrainingScriptSection } from '../components/script/script-section'

interface TrainingContextState {
    trainingData: TrainingData | null
    trainingScriptSectionToEdit: TrainingScriptSection | null
    updateTrainingData: (trainingData: TrainingData | null, setLocal?: boolean, updateApi?: boolean) => Promise<void>
    setTrainingScriptSectionToEdit: (trainingSection: TrainingScriptSection | null) => void
}

const defaultTrainingContextState = {
    trainingData: null,
    trainingScriptSectionToEdit: null,
    updateTrainingData: async () => {},
    setTrainingScriptSectionToEdit: async () => {},
}

const TrainingContext = createContext<TrainingContextState>(defaultTrainingContextState)
const TrainingProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const [trainingData, _updateTrainingData] = useState<TrainingData | null>(null)
    const [trainingScriptSectionToEdit, _setTrainingScriptSectionToEdit] = useState<TrainingScriptSection | null>(null)

    const updateTrainingData = useCallback(
        async (trainingData: TrainingData | null, setLocal = false, updateApi = true) => {
            if (!trainingData) {
                _updateTrainingData(null)
                return
            }

            try {
                let result
                if (updateApi) {
                    result = await TrainingService.updateTraining((trainingData as TrainingData)?.id, trainingData as TrainingData)
                }
                if (setLocal) _updateTrainingData(trainingData)
                else {
                    if (updateApi && result) {
                        _updateTrainingData(result.data)
                    } else {
                        _updateTrainingData(trainingData)
                    }
                }
            } catch (err) {
                _updateTrainingData(trainingData)
                console.error(err)
            }
        },
        [_updateTrainingData],
    )
    const setTrainingScriptSectionToEdit = useCallback(
        (trainingScriptSectionToEdit: TrainingScriptSection | null) => {
            if (!trainingScriptSectionToEdit) {
                _setTrainingScriptSectionToEdit(null)
                return
            } else {
                _setTrainingScriptSectionToEdit(trainingScriptSectionToEdit)
            }
        },
        [_setTrainingScriptSectionToEdit],
    )

    const contextValue = useMemo(
        () => ({
            trainingData,
            trainingScriptSectionToEdit,
            updateTrainingData,
            setTrainingScriptSectionToEdit,
        }),
        [trainingData, updateTrainingData, setTrainingScriptSectionToEdit, trainingScriptSectionToEdit],
    )
    return <TrainingContext.Provider value={contextValue}>{children}</TrainingContext.Provider>
}

export { TrainingContext, TrainingProvider }
