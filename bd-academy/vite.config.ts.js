// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_BD_ACADEMY_");
  return {
    base: env.VITE_BD_ACADEMY_BASE_URL,
    publicDir: "public",
    plugins: [
      basicSsl(),
      svgr(),
      react(),
      viteStaticCopy({
        targets: [
          {
            src: path.join("C:\\Users\\seemy\\Documents\\projects\\ilms-smm\\bd-academy", "/node_modules/playcanvas/scripts/posteffects/posteffect-outline.js"),
            dest: path.join("C:\\Users\\seemy\\Documents\\projects\\ilms-smm\\bd-academy", "/public/static/posteffects")
          }
        ]
      })
    ]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSdcclxuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3ZncidcclxuaW1wb3J0IGJhc2ljU3NsIGZyb20gJ0B2aXRlanMvcGx1Z2luLWJhc2ljLXNzbCdcclxuXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcclxuICAgIC8vTG9hZCBlbnYgZmlsZSB0byBnZXQgYmFzZSB1cmxcclxuICAgIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJ1ZJVEVfQkRfQUNBREVNWV8nKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiYXNlOiBlbnYuVklURV9CRF9BQ0FERU1ZX0JBU0VfVVJMLFxyXG4gICAgICAgIHB1YmxpY0RpcjogJ3B1YmxpYycsXHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgICBiYXNpY1NzbCgpLFxyXG4gICAgICAgICAgICBzdmdyKCksXHJcbiAgICAgICAgICAgIHJlYWN0KCksXHJcbiAgICAgICAgICAgIHZpdGVTdGF0aWNDb3B5KHtcclxuICAgICAgICAgICAgICAgIHRhcmdldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogcGF0aC5qb2luKFwiQzpcXFxcVXNlcnNcXFxcc2VlbXlcXFxcRG9jdW1lbnRzXFxcXHByb2plY3RzXFxcXGlsbXMtc21tXFxcXGJkLWFjYWRlbXlcIiwgJy9ub2RlX21vZHVsZXMvcGxheWNhbnZhcy9zY3JpcHRzL3Bvc3RlZmZlY3RzL3Bvc3RlZmZlY3Qtb3V0bGluZS5qcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0OiBwYXRoLmpvaW4oXCJDOlxcXFxVc2Vyc1xcXFxzZWVteVxcXFxEb2N1bWVudHNcXFxccHJvamVjdHNcXFxcaWxtcy1zbW1cXFxcYmQtYWNhZGVteVwiLCAnL3B1YmxpYy9zdGF0aWMvcG9zdGVmZmVjdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgXSxcclxuICAgIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxXQUFXO0FBRS9DLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsa0JBQWtCO0FBQzNELFNBQU87QUFBQSxJQUNILE1BQU0sSUFBSTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsU0FBUztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsS0FBSztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sZUFBZTtBQUFBLFFBQ1gsU0FBUztBQUFBLFVBQ0w7QUFBQSxZQUNJLEtBQUssS0FBSyxLQUFLLCtEQUErRCxvRUFBb0U7QUFBQSxZQUNsSixNQUFNLEtBQUssS0FBSywrREFBK0QsNEJBQTRCO0FBQUEsVUFDL0c7QUFBQSxRQUNKO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
