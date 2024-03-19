import React from 'react'
import { ClassicPreset } from 'rete'
import { FlewRow, FlexCol, Input, Label, Textarea } from '../styled-components'
import { ButtonControl, CustomDeleteButton } from './button-control'

export class StatementControl extends ClassicPreset.Control {
    public value: string = ''
    public points: number = 0
    constructor(
        public label: string,
        public options: {
            initial: { value: string; points: number }
            change?: (param: 'value' | 'points', value: string | number) => void
            delete?: () => void
        },
    ) {
        super()
        if (this.options.initial.value !== undefined) {
            this.setValue(this.options.initial.value)
        }
        if (this.options.initial.points !== undefined) {
            this.setPoints(this.options.initial.points)
        }
    }
    setValue(value: string | number): void {
        if (value !== undefined) {
            this.value = value.toString()
            this.options.change?.('value', value)
        }
    }
    setPoints(points: number): void {
        if (points !== undefined) {
            this.points = points
            this.options.change?.('points', points)
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomStatement(props: { data: StatementControl; styles?: () => any }) {
    const [value, setValue] = React.useState(props.data.value)
    const [points, setPoints] = React.useState(props.data.points)
    const ref = React.useRef(null)

    // Drag.useNoDrag(ref)
    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])
    React.useEffect(() => {
        setPoints(props.data.points)
    }, [props.data.points])

    return (
        <div>
            <FlewRow>
                <FlexCol style={{ minWidth: '75%' }}>
                    <Label styles={props.styles}>{props.data.label}</Label>
                    <Textarea
                        value={value}
                        ref={ref}
                        readOnly={false}
                        onChange={(e) => {
                            const val = e.target.value
                            setValue(val)
                            props.data.setValue(val)
                        }}
                        styles={props.styles}
                        rows={4}
                    ></Textarea>
                </FlexCol>
                <FlexCol>
                    <Label styles={props.styles}>Points</Label>
                    <Input
                        value={points}
                        type={'number'}
                        ref={ref}
                        readOnly={false}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            setPoints(val)
                            props.data.setPoints(val)
                        }}
                        styles={props.styles}
                    ></Input>
                    {props.data.options.delete && (
                        <CustomDeleteButton
                            data={
                                new ButtonControl('Delete', () => {
                                    props.data.options.delete?.()
                                })
                            }
                        ></CustomDeleteButton>
                    )}
                </FlexCol>
            </FlewRow>
        </div>
    )
}
