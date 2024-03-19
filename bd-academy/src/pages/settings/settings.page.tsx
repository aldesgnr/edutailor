import { FunctionComponent } from 'react'

import './settings.page.css'

export const SettingsPage: FunctionComponent = () => {
    return (
        <div className={'app-content settings  flex h-full w-full flex flex-col  gap-5  '}>
            <h2>Settings</h2>
            <div className={'flex flex-row gap-5'}>Settings component</div>
        </div>
    )
}
