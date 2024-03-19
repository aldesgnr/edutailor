export const appConfig = () => {
    const BASE_URL = import.meta.env.VITE_BD_ACADEMY_BASE_URL
    const SIMPLE_MODELS = import.meta.env.VITE_BD_ACADEMY_SIMPLE_MODELS?.toLowerCase() === 'true'
    const VIEWER_DEBUG = import.meta.env.VITE_BD_ACADEMY_VIEWER_DEBUG?.toLowerCase() === 'true'
    const EDITOR_DEBUG = import.meta.env.VITE_BD_ACADEMY_EDITOR_DEBUG?.toLowerCase() === 'true'
    const STATIC_URL = import.meta.env.VITE_BD_ACADEMY_STATIC_URL
    const API_URL = import.meta.env.VITE_BD_ACADEMY_API_URL
    return { BASE_URL, SIMPLE_MODELS, VIEWER_DEBUG, EDITOR_DEBUG, STATIC_URL, API_URL }
}
