module.exports = (node, graph) => {
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const textureIn = node.in('texture')
  const opacityIn = node.in('opacity',1,{min:0,max:1})
  const ctx = graph.ctx
  
  const drawCmd = {
    pipeline: ctx.pipeline({
      vert: `
        attribute vec2 aPosition;
        attribute vec2 aTexCoord;
        varying vec2 vTexCoord;
        void main () {
          vTexCoord = aTexCoord;
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
        `,
      frag: `
        precision highp float;
        varying vec2 vTexCoord;
        uniform sampler2D uTexture;
        uniform float uOpacity;
        void main () {
          vec2 texC = vTexCoord;
          //texC.y = 1.0 - texC.y;
          vec4 color = texture2D(uTexture, texC);
          gl_FragColor = vec4(color.rgb, color.a*uOpacity);
          // gl_FragColor = vec4(texC, 0.0, 1.0);
          // gl_FragColor.xy += texC;
        }
        `,
      blend: false,
      // blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
      // blendSrcAlphaFactor: ctx.BlendFactor.One,
      // blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
      // blendDstAlphaFactor: ctx.BlendFactor.One
    }),
    attributes: {
      aPosition: ctx.vertexBuffer([[-1, -1], [1, -1], [1, 1], [-1, 1]]),
      aTexCoord: ctx.vertexBuffer([[0, 0], [1, 0], [1, 1], [0, 1]])
    },
    indices: ctx.indexBuffer([[0, 1, 2], [0, 2, 3]]), 
  }
  
  const texture = ctx.texture2D({
    width: 1024,
    // width: ctx.gl.drawingBufferWidth,
    height: 1024,
    // height: ctx.gl.drawingBufferHeight,
    min: ctx.Filter.LinearMipmapLinear,
    mag: ctx.Filter.Linear,
    mipmap: true,
    pixelFormat: ctx.PixelFormat.RGBA32F
  })
  const copyToTextureCmd = {
    pass: ctx.pass({
      color: [texture],
      clearColor: [0,0,0,1]
    }),
    viewport: [0, 0, 1024, 1024]
  }
  
  triggerIn.onTrigger = (props) => {
    ctx.submit(copyToTextureCmd, () => {
      ctx.submit(drawCmd, {
        uniforms: {
          uTexture: props.frameColorMap,
          uOpacity: opacityIn.value
        }
      })
    })
    ctx.update(texture, {
      mipmap: true
    })
    triggerOut.trigger({
      ...props,
      frameColorMapCopy: texture
    })    
  }
  
}