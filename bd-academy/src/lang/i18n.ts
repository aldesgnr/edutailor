import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './locales/resources'
// import LanguageDetector from "i18next-browser-languagedetector"

i18n
    // .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'pl',
        supportedLngs: ['en', 'pl'],
        detection: { order: ['localStorage', 'navigator'] },
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    })

const isEN = window.location.href.indexOf('en') !== -1 ? true : false

if (isEN) {
    i18n.changeLanguage('en')
} else {
    i18n.changeLanguage('pl')
}
export default i18n
