import { FunctionComponent } from 'react'
import './sidebar.css'
export type SidebarProps = { children: any }

export const Sidebar: FunctionComponent<SidebarProps> = ({ children }) => {
    return <div className={`sidebar`}>{children}</div>
}
