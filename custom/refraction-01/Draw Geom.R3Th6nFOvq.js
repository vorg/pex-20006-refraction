module.exports = (node, graph) => {
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const textureIn = node.in('texture')
  
  const { cube: createCube } = require('primitive-geometry')
  const { vec3 } = require('pex-math')
  const { ctx } = graph
  
  const geomIn = node.in('geom', null)
    
  const geom = createCube(1)
  
  const drawCmd = {
    pipeline: ctx.pipeline({
      vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec3 aOffset;

      varying vec3 vNormalView;      

      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;  
      varying vec3 vPositionView;

      void main () {        
        vNormalView = vec3(uViewMatrix * vec4(aNormal, 0.0));
        vPositionView = (uViewMatrix * vec4(aPosition + aOffset, 1.0)).xyz;
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition + aOffset, 1.0);
      }
      `,
      frag: `
      #extension GL_EXT_shader_texture_lod : enable
      precision highp float;     
      varying vec3 vNormalView;
      varying vec3 vPositionView;
      varying float vAO;
      uniform vec2 uScreenSize;
      uniform sampler2D uFrameColorMap;
      uniform sampler2D uMatCap;
        
      vec3 tonemapAces( vec3 x ) {
          float tA = 2.5;
          float tB = 0.03;
          float tC = 2.43;
          float tD = 0.59;
          float tE = 0.14;
          return clamp((x*(tA*x+tB))/(x*(tC*x+tD)+tE),0.0,1.0);
      }
        
      void main () {
        vec3 L = normalize(vec3(1.0));
        vec3 N = normalize(vNormalView);
        float NdotL = dot(N, L);
        float diffuse = (NdotL + 1.0) / 2.0;
      	gl_FragData[0].rgb = vNormalView * 0.5 + 0.5;
        
        vec3 I = vec3(0.0, 0.0, 1.0);
        vec3 R = refract(I, N, 1.0);
        vec2 screenUV = gl_FragCoord.xy / uScreenSize.xy + R.xy * 0.02;
        float blur = 1.0 - max(0.0, dot(N, I));
        gl_FragData[0] = vec4(1.0, 1.0, 0.6, 1.0) * texture2DLodEXT(uFrameColorMap, screenUV, 1.0 + blur * 6.0);
                
        // gl_FragData[0] = vec4(1.0 - blur);
        
        vec3 e = normalize(vPositionView);
        vec3 r = (reflect(e, N));
        float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0));
        vec2 mN = r.xy / m + 0.5;
        gl_FragData[0].rgb += pow(texture2D(uMatCap, mN).rgb, vec3(2.2));
        // gl_FragData[0].rg += 0.1 * gl_FragCoord.xy / uScreenSize.xy;
        // gl_FragData[0].rgb = tonemapAces(gl_FragData[0].rgb);
        gl_FragData[0].a = 1.0;
      }
      `,
      depthTest: true,
      depthWrite: true,
      blend: false,
      blendSrcRGBFactor: ctx.BlendFactor.SrcColor,
      blendSrcAlphaFactor: ctx.BlendFactor.One,
      blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcColor,
      blendDstAlphaFactor: ctx.BlendFactor.One
    }),
    attributes: {
      aPosition: ctx.vertexBuffer(geom.positions),
      aAO: ctx.vertexBuffer(geom.positions.map(() => 1)),
      aNormal: ctx.vertexBuffer(geom.normals),
      aOffset: { buffer: ctx.vertexBuffer(geom.offsets || [0, 0, 0]), divisor: 1 }
    },
    indices: ctx.indexBuffer(geom.cells),
    instances: geom.offsets ? geom.offsets.length : 1
  }
  
  geomIn.onChange = () => {
    var geom = geomIn.value
    if (!geom) return
    
    ctx.update(drawCmd.attributes.aPosition, { data: geom.positions })
    ctx.update(drawCmd.attributes.aNormal, { data: geom.normals })
    ctx.update(drawCmd.attributes.aOffset.buffer, { data: geom.offsets || [0, 0, 0] })
    ctx.update(drawCmd.attributes.aAO, { data: geom.ao || geom.positions.map(() => 1) })
    ctx.update(drawCmd.indices, { data: geom.cells })
    drawCmd.instances = geom.offsets ? geom.offsets.length : 1
  }

  triggerIn.onTrigger = (props) => {
    const { camera } = props

    if (!textureIn.value) return
    
    ctx.submit(drawCmd, {
      uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uScreenSize: [ctx.gl.drawingBufferWidth, ctx.gl.drawingBufferHeight],
        uFrameColorMap: props.frameColorMapCopy,
        uMatCap: textureIn.value
      }
    })
    triggerOut.trigger(props)
  }
}
