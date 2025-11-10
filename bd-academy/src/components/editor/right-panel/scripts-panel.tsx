import { PrimeIcons } from 'primereact/api'
import { Divider } from 'primereact/divider'
import { FunctionComponent, useState } from 'react'
import { uuidv4 } from '../../../services/training/training.service'
import { Hint } from '../../common/hint/hint'
import { SecondaryButton } from '../../common/secondary-button/secondary-button'
import { TrainingScriptSection } from '../../script/script-section'
import { ScriptShortPreview } from './script-short-preview'

export const ScriptsPanel: FunctionComponent = () => {
    const [scriptSections] = useState<TrainingScriptSection[]>([
        {
            id: uuidv4(),
            title: 'Interview',
            trainingSectionComponents: [],
        },
        {
            id: uuidv4(),
            title: 'Good bye',
            trainingSectionComponents: [],
        },
    ])
    return (
        <div className={' flex flex-col  gap-[16px] text-center'}>
            <p>Scripts</p>
            <Divider></Divider>
            <div className={'flex gap-[8px] bg-white rounded-[16px] h-[56px] text-black flex-row items-center pr-[8px]'}>
                <img src="" width={56} height={56} />
                <div className="flex flex-col flex-1 text-left">
                    <strong>Patient 1 </strong>
                    <span>Joe Blue</span>
                </div>
                <i className={PrimeIcons.CHEVRON_DOWN}></i>
            </div>
            {scriptSections.map((script) => {
                return <ScriptShortPreview key={`script-short_${script.id}`} script={script}></ScriptShortPreview>
            })}
            <Hint text={'If you want to edit scripts or create new ones go to the Script Editor'}></Hint>

            <SecondaryButton label={'Go to Script Editor'} icon={PrimeIcons.CHEVRON_RIGHT} onClick={() => {}}></SecondaryButton>
            <Divider></Divider>
        </div>
    )
}
