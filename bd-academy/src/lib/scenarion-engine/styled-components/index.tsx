import styled from 'styled-components'
export const Label = styled.label<{ styles?: (props: any) => any }>`
    width: 100%;
    font-size: 110%;
    box-sizing: border-box;
    color: black;
    cursor: pointer;
    ${(props) => props.styles && props.styles(props)}
`

export const Input = styled.input<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: white;
    padding: 2px 6px;
    border: 1px solid #999;
    font-size: 110%;
    box-sizing: border-box;
    color: black;
    ${(props) => props.styles && props.styles(props)}
`

export const Button = styled.button<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: white;
    padding: 2px 6px;
    border: 1px solid #999;
    font-size: 110%;
    box-sizing: border-box;
    color: black;
    ${(props) => props.styles && props.styles(props)}
`
export const AddButton = styled.button<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: #008000;
    padding: 2px 6px;
    border: 1px solid #008000b8;
    font-size: 110%;
    box-sizing: border-box;
    color: white;
    &:hover {
        border: 1px solid #008000b8;
        background-color: #008000b8;
    }
    ${(props) => props.styles && props.styles(props)}
`
export const DeleteButton = styled.button<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: #e40000;
    padding: 2px 6px;
    border: 1px solid #e40000;
    font-size: 110%;
    box-sizing: border-box;
    color: white;
    &:hover {
        border: 1px solid #c77272aa;
        background-color: #c77272aa;
    }
    ${(props) => props.styles && props.styles(props)}
`
export const Textarea = styled.textarea<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: white;
    padding: 2px 6px;
    border: 1px solid #999;
    font-size: 110%;
    box-sizing: border-box;
    color: black;
    ${(props) => props.styles && props.styles(props)}
`

export const Select = styled.select<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 5px;
    background-color: white;
    padding: 2px 6px;
    border: 1px solid #999;
    font-size: 110%;
    box-sizing: border-box;
    cursor: pointer;
    color: black;
    ${(props) => props.styles && props.styles(props)}
`
export const Option = styled.option<{ styles?: (props: any) => any }>`
    width: 100%;
    background-color: white;
    padding: 2px 6px;
    font-size: 110%;
    box-sizing: border-box;
    color: black;
    ${(props) => props.styles && props.styles(props)};
`

export const FlewRow = styled.div<{ styles?: (props: any) => any }>`
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
    color: black;
    ${(props) => props.styles && props.styles(props)};
`

export const FlexCol = styled.div<{ styles?: (props: any) => any }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0px;
    color: black;
    ${(props) => props.styles && props.styles(props)};
`
