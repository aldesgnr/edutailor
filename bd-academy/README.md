## Adding New scene

1. Copy scene file in glb format to fodler `bd-academy-static/static/common/scenes/`.
2. Add this scene to `bd-academy-static/static/common/editor-configuration.json` to section scenes with following properties.

## Adding new scene to production

If you want add scene to prod app, copy same things but to VPS via FTP.
addres : 185.201.114.251
port : 22
user : root
password : US**\*\*\*\***

Destination `/home/ilms-static-braindance/htdocs/static/common/scenes/` and `/home/ilms-static-braindance/htdocs/static/common/editor-configuration.json` .

## After uplaodin new scene,

New test training need to be created. Create new training, add section, select added scene and click preview. From url get trainingSectionUUID, and copy this to editor-configuration to `previewSceneTraining` attribute. After this should be working.
