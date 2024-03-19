import { FunctionComponent, useContext, useEffect, useState } from 'react'
import '../training.css'

import 'primeicons/primeicons.css' //icons
import 'primereact/resources/primereact.min.css' //core css
import { TabPanel, TabView } from 'primereact/tabview'
import { TrainingContext } from '../../../contexts/training-context'
import { TrainingData } from '../training-card.component'

export const TrainingParticipantsTabComponent: FunctionComponent = () => {
    const [localParticipants, setlocalParticipants] = useState<[]>([])
    const { trainingData, updateTrainingData } = useContext(TrainingContext)
    const [localTrainingData, setLocalTrainingData] = useState<TrainingData | null>(null)

    useEffect(() => {
        !localTrainingData && setLocalTrainingData(trainingData)
    }, [trainingData])

    useEffect(() => {
        setlocalParticipants(localParticipants)
    }, [localParticipants])

    useEffect(() => {
        localTrainingData && updateTrainingData(localTrainingData, true, false)
    }, [localTrainingData])

    return (
        <div className={'training-participants'}>
            <TabView>
                <TabPanel header="participants 1"></TabPanel>
                <TabPanel header="participants 2"></TabPanel>
            </TabView>
        </div>
    )
}
