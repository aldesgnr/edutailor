import { Button } from 'antd'
import { ClassicPreset } from 'rete'
import { AddButton, DeleteButton } from '../styled-components'
import React from 'react'

export class ButtonControl extends ClassicPreset.Control {
    public value = ''
    constructor(
        public label: string,
        public onClick: () => void,
    ) {
        super()
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomButton(props: { data: ButtonControl; styles?: () => any }) {
    return (
        <Button onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} onClick={props.data.onClick} style={{ width: '100%' }}>
            {props.data.label}
        </Button>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomAddButton(props: { data: ButtonControl; styles?: () => any }) {
    return (
        <AddButton onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} onClick={props.data.onClick} style={{ width: '100%' }}>
            {props.data.label}
        </AddButton>
    )
}

export function CustomDeleteButton(props: { data: ButtonControl; styles?: () => any }) {
    return (
        <DeleteButton
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={props.data.onClick}
            style={{ width: '100%' }}
        >
            {props.data.label}
        </DeleteButton>
    )
}
