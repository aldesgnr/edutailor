import { Panel } from 'primereact/panel'
import { FunctionComponent, useEffect, useState } from 'react'
import { Ripple } from 'primereact/ripple'
import { PrimeIcons } from 'primereact/api'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'

export type ScriptShortPreviewProps = {
    script: any
}

export const ScriptShortPreview: FunctionComponent<ScriptShortPreviewProps> = ({ script }) => {
    const [scriptSection, setScriptSection] = useState<any>(script)

    useEffect(() => {
        setScriptSection(script)
    }, [script])
    const headerTemplate = (options: any) => {
        const toggleIcon = options.collapsed ? PrimeIcons.CHEVRON_RIGHT : PrimeIcons.CHEVRON_DOWN
        const className = `${options.className} justify-start text-black flex flex-row gap-[8px] bg-white`

        return (
            <div className={className}>
                <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <i className={toggleIcon + ' text-black'}></i>
                    <Ripple />
                </button>
                <i className={PrimeIcons.COMMENTS} />
                <div className="flex flex-col gap-[2px] text-left">
                    <strong className={`${options.titleClassName} text-black`}>Header</strong>
                    <span className={`${options.titleClassName} text-[#292B2D]`}>
                        <span className="text-primary">12</span> ELEMENTS
                    </span>
                </div>
            </div>
        )
    }
    return (
        <Panel
            headerTemplate={headerTemplate}
            toggleable
            collapsed={false}
            pt={{
                root: {
                    className: 'script-short-preview bg-white rounded-[8px] border-[0px]',
                },
                header: {
                    className: 'bg-white rounded-[8px] border-[0px]',
                },
                content: {
                    className: 'bg-white rounded-[8px] border-[0px] pt-0',
                },
            }}
        >
            <hr style={{ padding: 0 }} />
            <div className="flex flex-col gap-[8px]  justify-center items-center ">
                <Button
                    label="SCRIPT STARTS HERE"
                    severity="info"
                    size="small"
                    pt={{
                        root: {
                            className: 'max-h-[21px] w-[fit-content]  text-[white] text-[11px]  p-[5px] justify-center items-center my-[7px]',
                        },
                        label: {
                            className: 'w-auto flex-[1_1_1]',
                        },
                    }}
                />
                <Divider
                    pt={{
                        root: { className: 'before:border-[var(--dark-200)] ' },
                    }}
                ></Divider>
                <div>SCRIPT CONENT</div>
                <Divider
                    pt={{
                        root: { className: 'before:border-[var(--dark-200)] ' },
                    }}
                ></Divider>
                <Button
                    label="SCRIPT ENDS HERE"
                    severity="danger"
                    size="small"
                    pt={{
                        root: {
                            className: 'max-h-[21px] w-[fit-content] text-[white] text-[11px]  p-[5px]   justify-center items-center  my-[7px]',
                        },
                        label: {
                            className: 'w-auto flex-[1_1_1]',
                        },
                    }}
                />
            </div>
        </Panel>
    )

    {
        /* <div className={'flex flex row gap-[8px] h-[64px] p-[17px]  bg-white rounded-[8px]'}>{scriptSection.title}</div> */
    }
}
