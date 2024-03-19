import React from 'react'
import ReactDOM from 'react-dom/client'

import { PrimeReactProvider } from 'primereact/api'
import './assets/fonts/satoshi/css/satoshi.css'

import './index.css'

// raczej powinno bvyc nizej
// import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css'
import 'primereact/resources/themes/lara-dark-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import App from './App'

import './lang/i18n'

import trailWindConfig from '../tailwind.config.js'
import { classNames } from 'primereact/utils'

if (trailWindConfig.theme && trailWindConfig.theme.extend) {
    let css = ':root {\n'
    for (const color in trailWindConfig.theme.extend.colors) {
        css += `  --${color}: ${trailWindConfig.theme.extend.colors[color as keyof typeof trailWindConfig.theme.extend.colors]};\n`
    }
    css += '}'
    document.head.insertAdjacentHTML('beforeend', `<style type="text/css">${css}</style>`)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <PrimeReactProvider
            value={{
                unstyled: false,
                pt: {
                    inputswitch: {
                        slider: { className: 'rounded-2xl before:rounded-2xl ' },
                    },

                    inputtext: {
                        root: {
                            className:
                                'text-[14px] leading-[14px] font-[700]border-[1px] h-[30px] w-full hover:border-[var(--primary)] active:border-[2px] active:border-[var(--primary)]',
                        },
                        // root: (state) => {

                        //     return classNames('border-[1px] h-[30px] w-full', { '': state.hover })
                        // },
                    },
                    inputtextarea: {
                        root: { className: 'text-[14px] leading-[14px] border-[1px] w-full hover:border-[var(--primary)]' },
                        // root: (state) => {

                        //     return classNames('border-[1px] h-[30px] w-full', { '': state.hover })
                        // },
                    },
                    checkbox: {
                        root: { className: 'max-w-[20px]' },
                        input: { className: 'bg-[white]' },
                    },
                    card: {
                        root: { className: 'p-[0px] rounded-[16px] bg-[var(--dark-800)] ' },
                        content: { className: 'p-[0px] text-[12px] leading-[18px] text-[var(--cardContentColor)] ' },
                        title: { className: 'text-[20px] leading-[13px] text-[var(--cardTitleColor)] font-medium' },
                        body: { className: 'p-[14px] h-full  flex flex-col ' },
                        footer: { className: 'h-[16px] p-0' },
                    },
                    divider: {
                        root: {
                            className: 'm-[0px] before:border-[1px] before:border-[#66C596]',
                        },
                    },
                    chip: {
                        root: { className: 'rounded-[4px] color-[#ffffff] bg-[#FFFFFF4D] text-[10px] leading-[13px] p-[4px] gap-[8px]' },
                    },
                    badge: {
                        root: {
                            className: 'text-[#000] text-[9px] h-[13px] w-[13px] min-h-[13px] min-w-[13px] leading-[13px] translate-x-[30%] translate-y-[-30%]',
                        },
                    },
                    tabview: {
                        root: {
                            className: 'bg-[var(--content)]',
                        },
                        navContainer: {
                            className: 'bg-[var(--content)]',
                        },
                        navContent: {
                            className: 'bg-[var(--content)]',
                        },
                        nav: {
                            className: 'bg-[var(--content)] gap-[18px] text-[14px]',
                        },
                        panelContainer: {
                            className: 'bg-[var(--content)]',
                        },
                        inkbar: {
                            className: 'bg-[var(--primary)] hover:bg-[var(--primary)]',
                        },
                    },
                    toolbar: {
                        root: {
                            className: 'border-[0px] border-b-[1px] border-[var(--primary)] rounded-[0px] bg-[var(--content)] p-0 h-[66px] px-[24px]',
                        },
                    },
                    tabpanel: {
                        root: {
                            className: 'bg-[var(--content)] ',
                        },
                        content: {
                            className: 'bg-[var(--content)]',
                        },
                    },
                    button: {
                        root: {
                            className: 'padding-[10px]',
                        },
                    },
                    calendar: {
                        root: {
                            className: 'bg-[var(--dark-800)] rounded-[16px] text-[14px] w-full max-w-[370px]',
                        },
                        panel: {
                            className: ' bg-[var(--dark-800)]  text-[14px]  p-[0px] ',
                        },
                        timePicker: {
                            className: ' bg-[var(--dark-800)]  text-[14px]  p-[7px] max-h-[78px] ',
                        },
                        header: {
                            className: ' bg-[var(--dark-800)]  text-[14px] ',
                        },
                        tableHeaderCell: {
                            className: 'text-[12px] leading-[21px] p-[7px]',
                        },
                        day: {
                            className: 'text-[12px] leading-[21px] p-[7px] max-w-[35px] max-h-[35px]',
                        },
                        monthTitle: {
                            className: 'text-[12px] leading-[21px] hover:text-[var(--primary)]',
                        },
                        yearTitle: {
                            className: 'text-[12px] leading-[21px]  hover:text-[var(--primary)]',
                        },
                        hour: {
                            className: 'text-[17px] leading-[21px]  hover:text-[var(--primary)] cursor-pointer',
                        },
                        minute: {
                            className: 'text-[17px] leading-[21px]  hover:text-[var(--primary)] cursor-pointer',
                        },
                        incrementButton: {
                            className: 'text-[13px] leading-[24px] h-[24px]  hover:text-[var(--primary)]',
                        },
                        decrementButton: {
                            className: 'text-[13px] leading-[24px] h-[24px]  hover:text-[var(--primary)]',
                        },
                        dayLabel: (props) => {
                            return classNames('hover:bg-[var(--calendar-hover)] ', {
                                'bg-[var(--calendar-active)]': props?.context?.selected,
                            })
                        },
                    },
                    menu: {
                        root: {
                            className: 'bg-[var(--dark-800)]',
                        },
                    },
                    panel: {
                        root: {
                            className: ' rounded-[14px] border-[0px] ',
                        },
                        header: {
                            className: 'bg-[var(--content)] p-[14px] rounded-[14px] border-[0px] min-h-[50px] max-h-[50px]',
                        },
                        content: {
                            className: 'bg-[transparent] p-[14px] rounded-[14px] border-[0px] flex flex-col gap-[14px]',
                        },
                    },
                    dataview: {
                        root: {
                            className: 'bg-[transparent]',
                        },
                        content: {
                            className: 'bg-[transparent] flex flex-row gap-[14px] w-full',
                        },
                        grid: {
                            className: ' w-full flex flex-row gap-[14px] ',
                        },
                    },
                    breadcrumb: {
                        root: {
                            className: 'bg-transparent  min-h-[50px] border-[0px]',
                        },
                        menu: {
                            className: 'min-h-[50px] flex gap-[5px] ',
                        },
                        separator: {
                            className: 'm-[0px_4px]',
                        },
                    },
                },
            }}
        >
            <App />
        </PrimeReactProvider>
    </React.StrictMode>,
)
