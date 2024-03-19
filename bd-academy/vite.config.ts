import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'
import basicSsl from '@vitejs/plugin-basic-ssl'

import path from 'path'
export default defineConfig(({ command, mode }) => {
    //Load env file to get base url
    const env = loadEnv(mode, process.cwd(), 'VITE_BD_ACADEMY_')
    return {
        base: env.VITE_BD_ACADEMY_BASE_URL,
        publicDir: 'public',
        plugins: [
            basicSsl(),
            svgr(),
            react(),
            viteStaticCopy({
                targets: [
                    {
                        src: path.join(__dirname, '/node_modules/playcanvas/scripts/posteffects/posteffect-outline.js'),
                        dest: path.join(__dirname, '/public/static/posteffects'),
                    },
                ],
            }),
        ],
    }
})
