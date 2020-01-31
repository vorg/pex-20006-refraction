module.exports = (node, graph) => {
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const textureIn = node.in('texture')
  const opacityIn = node.in('opacity',1,{min:0,max:1})
  const ctx = graph.ctx
  
  const clearCmd = {
    pass: ctx.pass({
      clearColor: [1, 0, 0, 1]
    })
  }
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
        
         vec3 tonemapAces( vec3 x ) {
            float tA = 2.5;
            float tB = 0.03;
            float tC = 2.43;
            float tD = 0.59;
            float tE = 0.14;
            return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),0.0,1.0);
        }
        void main () {
          vec2 texC = vTexCoord;
          //texC.y = 1.0 - texC.y;
          vec4 color = texture2D(uTexture, texC);
          gl_FragColor = vec4(color.rgb, color.a*uOpacity);
          gl_FragColor.rgb = tonemapAces(color.rgb);
          gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
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
  
  triggerIn.onTrigger = (props) => {
    if (textureIn.value) {
      node.comment = '' + textureIn.value.id
      ctx.submit(drawCmd, {
        uniforms: {
          uTexture: textureIn.value,
          uOpacity: opacityIn.value
        }
      })
    } else {
      node.comment = 'empty'
    }
    triggerOut.trigger(props)    
  }
  
}