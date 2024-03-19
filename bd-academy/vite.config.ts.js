// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
var vite_config_default = defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_BD_ACADEMY_BD_ACADEMY_')
    return {
        base: env.VITE_BD_ACADEMY_BASE_URL,
        publicDir: 'public',
        plugins: [
            react(),
            viteStaticCopy({
                targets: [
                    {
                        src: path.join(
                            'C:\\Users\\seemy\\Documents\\projects\\ilms\\bd-academy',
                            '/node_modules/playcanvas/scripts/posteffects/posteffect-outline.js',
                        ),
                        dest: path.join('C:\\Users\\seemy\\Documents\\projects\\ilms\\bd-academy', '/public/static/posteffects'),
                    },
                ],
            }),
        ],
    }
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xyXG4gICAgLy9Mb2FkIGVudiBmaWxlIHRvIGdldCBiYXNlIHVybFxyXG4gICAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnQkRfQUNBREVNWV8nKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiYXNlOiBlbnYuQkRfQUNBREVNWV9CQVNFX1VSTCxcclxuICAgICAgICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgICAgcmVhY3QoKSxcclxuICAgICAgICAgICAgdml0ZVN0YXRpY0NvcHkoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBwYXRoLmpvaW4oXCJDOlxcXFxVc2Vyc1xcXFxzZWVteVxcXFxEb2N1bWVudHNcXFxccHJvamVjdHNcXFxcaWxtc1xcXFxiZC1hY2FkZW15XCIsICcvbm9kZV9tb2R1bGVzL3BsYXljYW52YXMvc2NyaXB0cy9wb3N0ZWZmZWN0cy9wb3N0ZWZmZWN0LW91dGxpbmUuanMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdDogcGF0aC5qb2luKFwiQzpcXFxcVXNlcnNcXFxcc2VlbXlcXFxcRG9jdW1lbnRzXFxcXHByb2plY3RzXFxcXGlsbXNcXFxcYmQtYWNhZGVteVwiLCAnL3B1YmxpYy9zdGF0aWMvcG9zdGVmZmVjdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgXSxcclxuICAgIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxTQUFTLFdBQVc7QUFFL0MsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxhQUFhO0FBQ3RELFNBQU87QUFBQSxJQUNILE1BQU0sSUFBSTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsU0FBUztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sZUFBZTtBQUFBLFFBQ1gsU0FBUztBQUFBLFVBQ0w7QUFBQSxZQUNJLEtBQUssS0FBSyxLQUFLLDJEQUEyRCxvRUFBb0U7QUFBQSxZQUM5SSxNQUFNLEtBQUssS0FBSywyREFBMkQsNEJBQTRCO0FBQUEsVUFDM0c7QUFBQSxRQUNKO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
