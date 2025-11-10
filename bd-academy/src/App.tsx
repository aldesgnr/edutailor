import { version } from '../package.json'
import './App.css'
import { AppRouter } from './router/router'

function App() {
    /**
     * add appversion to head
     */
    const meta = document.createElement('meta')
    meta.name = 'appVersion'
    meta.content = version
    document.head.prepend(meta)
    return <AppRouter></AppRouter>
}

export default App
