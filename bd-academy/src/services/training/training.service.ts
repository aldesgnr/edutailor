import { AxiosHeaders } from 'axios'
import { TrainingData } from '../../components/training/training-card.component'
import { http } from '../../interceptors/axios'

export default class TrainingService {
    static addNewTraning() {
        return uuidv4()
    }

    static getTrainings() {
        return http.get<TrainingData[]>(`/api/Trainings`, {})
    }
    static getTraining(id: string) {
        return http.get<TrainingData>(`/api/Trainings/${id}`)
    }
    // static addTraining(id: string, trainingData: TrainingData) {
    //     const headers = new AxiosHeaders({
    //         'Content-Type': 'application/json',
    //     })
    //     return http.post(`/api/Trainings`, trainingData, { headers: headers })
    // }
    static updateTraining(id: string, trainingData: TrainingData) {
        const headers = new AxiosHeaders({
            'Content-Type': 'application/json',
        })
        return http.post(`/api/Trainings/${id}`, trainingData, { headers: headers })
    }

    static changeTrainingToFavorite(favoriteData: { trainingId: string; trainingCreatorId: string }) {
        return http.post(`/api/TrainingFavorite`, favoriteData, {})
    }
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
