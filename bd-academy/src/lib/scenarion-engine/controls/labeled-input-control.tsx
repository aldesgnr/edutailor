import React from 'react'
import { ClassicPreset } from 'rete'
import { Input, Label } from '../styled-components'

export class LabeledInputControl extends ClassicPreset.Control {
    public value: string | number = '22'

    public readonly: boolean = false
    constructor(
        public label: string,
        public type: 'text' | 'number',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public options: { initial: string | number; change?: (value: any) => void },
    ) {
        super()
        if (options.initial !== undefined) {
            this.value = options.initial
        }
        if (type) {
            this.type = type
        }
    }
    setValue(value: string | number): void {
        if (value !== undefined) {
            this.value = value.toString()
            this.options.change?.(value)
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomLabeledInput(props: { data: LabeledInputControl; styles?: () => any }) {
    const [value, setValue] = React.useState(props.data.value)
    const ref = React.useRef(null)

    // Drag.useNoDrag(ref)

    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])

    return (
        <div>
            <Label styles={props.styles}>{props.data.label}</Label>
            <Input
                value={value}
                type={props.data.type}
                ref={ref}
                readOnly={props.data.readonly}
                onChange={(e) => {
                    const val = (props.data.type === 'number' ? +e.target.value : e.target.value) as (typeof props.data)['value']

                    setValue(val)
                    props.data.setValue(val)
                }}
                styles={props.styles}
            ></Input>
        </div>
    )
}
