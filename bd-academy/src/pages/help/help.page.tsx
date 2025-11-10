import { FunctionComponent } from 'react'
import './help.css'
import { HelpCardComponent } from '../../components/common/help-card/help-card.component'

export const HelpPage: FunctionComponent = () => {
    return (
        <div className={'app-content help  flex h-full w-full flex flex-col  gap-5  '}>
            <h2>Help</h2>
            <div className={'flex flex-row gap-5'}>
                <HelpCardComponent></HelpCardComponent>
            </div>
        </div>
    )
}
