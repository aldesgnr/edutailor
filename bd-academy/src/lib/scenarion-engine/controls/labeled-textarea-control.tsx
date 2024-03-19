import { Button } from 'antd'
import React from 'react'
import { ClassicPreset } from 'rete'
import styled from 'styled-components'
import { Input, Label, Textarea } from '../styled-components'

export class LabeledTextareaControl extends ClassicPreset.Control {
    public value: string | number = ''
    public type: 'textarea' = 'textarea'
    public readonly: boolean = false
    constructor(
        public label: string,
        public options: { initial: string | number; change?: (value: any) => void },
    ) {
        super()
        if (options.initial !== undefined) {
            this.value = options.initial
        }
    }
    setValue(value: string | number): void {
        if (value !== undefined) {
            this.value = value.toString()
            this.options.change?.(value)
        }
    }
}

export function CustomTextarea(props: { data: LabeledTextareaControl; styles?: () => any }) {
    const [value, setValue] = React.useState(props.data.value)
    const ref = React.useRef(null)

    // Drag.useNoDrag(ref)

    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])

    return (
        <div>
            <Label styles={props.styles}>{props.data.label}</Label>
            <Textarea
                value={value}
                rows={4}
                ref={ref}
                readOnly={props.data.readonly}
                onChange={(e) => {
                    const val = e.target.value

                    setValue(val)
                    props.data.setValue(val)
                }}
                styles={props.styles}
            ></Textarea>
        </div>
    )
}
