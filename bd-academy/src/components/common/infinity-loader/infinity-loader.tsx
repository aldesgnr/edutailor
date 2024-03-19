import { FC } from 'react'
import './infinity-loader.css'
export interface InfinityLoaderProps {
    text?: string
    color?: string
}
export const InfinityLoader: FC<InfinityLoaderProps> = ({ text, color = '#4f9e5b' }) => {
    return (
        <div className={'infinity-loader-container'}>
            <div className={'infinity-loader'} style={{ borderBottomColor: color }}></div>
            {/* <ProgressSpinner style={{ width: '128px', height: '128px' }} strokeWidth="3" stroke={color} animationDuration="1s" /> */}
            {text && <span>{text}</span>}
        </div>
    )
}
