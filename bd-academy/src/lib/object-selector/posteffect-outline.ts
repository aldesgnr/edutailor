import { Color, GraphicsDevice, PostEffect, SEMANTIC_POSITION, Shader, Texture, createShaderFromCode } from 'playcanvas'

export class OutlineEffect extends PostEffect {
    public graphicsDevice
    private thickness
    public _colorData
    public color
    public texture
    public shader: Shader | undefined
    constructor(args: { graphicsDevice: GraphicsDevice; thickness: number }) {
        super(args.graphicsDevice)
        this.graphicsDevice = args.graphicsDevice
        this.thickness = args.thickness
        var fshader = [
            '#define THICKNESS ' + (this.thickness ? this.thickness.toFixed(0) : 1),
            'uniform float uWidth;',
            'uniform float uHeight;',
            'uniform vec4 uOutlineCol;',
            'uniform sampler2D uColorBuffer;',
            'uniform sampler2D uOutlineTex;',
            '',
            'varying vec2 vUv0;',
            '',
            'void main(void)',
            '{',
            '    vec4 texel1 = texture2D(uColorBuffer, vUv0);',
            '    float sample0 = texture2D(uOutlineTex, vUv0).a;',
            '    float outline = 0.0;',
            '    if (sample0==0.0)',
            '    {',
            '        for (int x=-THICKNESS;x<=THICKNESS;x++)',
            '        {',
            '            for (int y=-THICKNESS;y<=THICKNESS;y++)',
            '            {    ',
            '                float tex=texture2DLodEXT(uOutlineTex, vUv0 + vec2(float(x)/uWidth, float(y)/uHeight), 0.0).a;',
            '                if (tex>0.0)',
            '                {',
            '                    outline=1.0;',
            '                }',
            '            }',
            '        } ',
            '    }',
            '    gl_FragColor = mix(texel1, uOutlineCol, outline * uOutlineCol.a);',
            '}',
        ].join('\n')

        // this.shader = new Shader(this.graphicsDevice, {
        //     attributes: {
        //         aPosition: SEMANTIC_POSITION
        //     },
        //     vshader: [
        //         "attribute vec2 aPosition;",
        //         "",
        //         "varying vec2 vUv0;",
        //         "",
        //         "void main(void)",
        //         "{",
        //         "    gl_Position = vec4(aPosition, 0.0, 1.0);",
        //         "    vUv0 = (aPosition.xy + 1.0) * 0.5;",
        //         "}"
        //     ].join("\n"),
        //     fshader: [
        //         "precision " + this.graphicsDevice.precision + " float;",
        //         "",
        //         "uniform sampler2D uColorBuffer;",
        //         "",
        //         "varying vec2 vUv0;",
        //         "",
        //         "void main() {",
        //         "    vec4 texel = texture2D(uColorBuffer, vUv0);",
        //         "    vec3 luma = vec3(0.299, 0.587, 0.114);",
        //         "    float v = dot(texel.xyz, luma);",
        //         "    gl_FragColor = vec4(v, v, v, texel.w);",
        //         "}"
        //     ].join("\n")
        // });

        this.shader = createShaderFromCode(this.graphicsDevice, PostEffect.quadVertexShader, fshader, 'OutlineShader', {
            aPosition: SEMANTIC_POSITION,
        })

        // Uniforms
        this.color = new Color(1, 1, 1, 1)
        this.texture = new Texture(this.graphicsDevice)
        this.texture.name = 'pe-outline'
        this._colorData = new Float32Array(4)
    }

    createShader = () => {}

    render(inputTarget: any, outputTarget: any, rect: any) {
        var device = this.device
        var scope = device.scope

        this._colorData[0] = this.color.r
        this._colorData[1] = this.color.g
        this._colorData[2] = this.color.b
        this._colorData[3] = this.color.a

        scope.resolve('uWidth').setValue(inputTarget.width)
        scope.resolve('uHeight').setValue(inputTarget.height)
        scope.resolve('uOutlineCol').setValue(this._colorData)
        scope.resolve('uColorBuffer').setValue(inputTarget.colorBuffer)
        scope.resolve('uOutlineTex').setValue(this.texture)
        if (this.shader) {
            this.drawQuad(outputTarget, this.shader, rect)
        }
    }
}
