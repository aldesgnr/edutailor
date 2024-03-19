//create react component function

import { PrimeIcons } from 'primereact/api'
import { DataView } from 'primereact/dataview'
import { InputText } from 'primereact/inputtext'
import { FunctionComponent, useState } from 'react'
import { SecondaryButton } from '../common/secondary-button/secondary-button'

export type ScriptFileComponentProps = {}

export const ScriptFileComponent: FunctionComponent<ScriptFileComponentProps> = () => {
    const [loadedFiles, setLoadedFiles] = useState<File[]>([])
    const onUploadFile = (e: any) => {
        setLoadedFiles(Object.values(e.target.files))
    }
    const onClickUpdate = () => {
        console.log('update')
    }

    const itemTemplate = (file: File) => {
        return (
            <div className="flex flex-row gap-[24px] rounded-[14px] border-[1px] border-[var(--dark-600)] bg-[var(--dark-800)] py-[28px] px-[14px] items-center">
                <img className="w-[75px] h-[50px] " src={``} alt={file.name} />
                <div className="min-w-[260px]">{file.name}</div>
                <div>{file.size} kB</div>
            </div>
        )
    }

    return (
        <div className={'flex flex-col gap-[14px] bg-[var(--content)] rounded-[14px] p-[14px]'}>
            <div className={'flex flex-col gap-[14px]'}>
                <label htmlFor="title">Title*</label>
                <InputText
                    className={' w-[600px]'}
                    id="title"
                    title="Training title"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    multiple
                    onChange={(e) => onUploadFile(e)}
                ></InputText>
            </div>
            <SecondaryButton label={''} icon={PrimeIcons.UPLOAD} onClick={onClickUpdate}></SecondaryButton>

            <DataView value={loadedFiles} itemTemplate={itemTemplate} layout={'list'}></DataView>
        </div>
    )
}
