import { FunctionComponent } from 'react'
import './components.css'

export const ComponentsPage: FunctionComponent = () => {
    return (
        <div className={'app-content components  flex h-full w-full flex flex-col  gap-5  '}>
            <h2>Components</h2>
            <div className={'flex flex-row gap-5'}>Components contetn</div>
        </div>
    )
}
