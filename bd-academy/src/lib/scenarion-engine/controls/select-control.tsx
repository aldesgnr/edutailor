import React from 'react'
import { ClassicPreset } from 'rete'
import { Label, Select, Option } from '../styled-components'

export class SelectControl extends ClassicPreset.Control {
    public value: string = ''
    constructor(
        public label: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public options: { initial: string; change?: (value?: any) => void; options: { text: string }[] },
    ) {
        super()
        if (options.initial !== undefined) {
            this.value = options.initial
        }
    }
    setValue(value?: string | number): void {
        if (value !== undefined) {
            this.value = value.toString()
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomSelect(props: { data: SelectControl; styles?: () => any }) {
    const [value, setValue] = React.useState(props.data.value)
    const ref = React.useRef(null)

    // Drag.useNoDrag(ref)

    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])

    return (
        <div>
            <Label htmlFor={props.data.label} styles={props.styles}>
                {props.data.label}
            </Label>
            <Select
                id={props.data.label}
                value={value}
                ref={ref}
                onChange={(e) => {
                    const val = e.target.value
                    setValue(val)
                    props.data.setValue(val)
                }}
                onFocus={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
                onTouchStart={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}
                styles={props.styles}
            >
                {props.data.options.options &&
                    props.data.options.options.map((option) => {
                        return (
                            <Option key={'option_' + option.text} value={option.text}>
                                {option.text}
                            </Option>
                        )
                    })}
            </Select>
        </div>
    )
}
