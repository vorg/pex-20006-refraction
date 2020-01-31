module.exports = function (node, graph) {
  var Renderer = require('pex-renderer')
  
  var ctx = graph.ctx
  
  ctx.gl.getExtension('EXT_shader_texture_lod')
  ctx.gl.getExtension('OES_standard_derivatives')
  ctx.gl.getExtension('WEBGL_draw_buffers')
  ctx.gl.getExtension('OES_texture_float')
  
  const renderer = new Renderer({
    shadowQuality: 4,
    //rgbm: true,
    ctx: ctx,
    pauseOnBlur: false,
    profile: false
  })
  
  graph.renderer = renderer
  
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const postRenderOut = node.triggerOut('postRenderOut')
  
  var initialState = {
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1]
    },
    material: {
      baseColor: [1, 0, 0, 1],
      roughness: 0.5,
      metallic: 0.1,
      primitive: graph.ctx.Primitive.Triangles
    }
  }
  
  renderer.root.name = 'Rood ' + Date.now()
  node.error = ''
  
  function visit (entities, entityList) {
    if (entityList.length) {
      var parent = entityList[0]
    	entities.push(parent)
      for (let i = 1; i < entityList.length; i++) {
    	  var entity = entityList[i]
        if (entity.length) {
          renderer.add(entity[0], parent)
        }
        visit(entities, entity)
      }
    } else {
      entities(entityList)
    }
    return entities
    
  }
  
  var clearCmd = {
    pass: ctx.pass({
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    })
  }
  
  triggerIn.onTrigger = function (props) {
    if (node.error) return
    
    ctx.submit(clearCmd)
    
    var entity = [renderer.root]
    var newProps = Object.assign({}, props, initialState, {
      parentEntity: entity
    })
    let entities = []
    try {
    	triggerOut.trigger(newProps)
    
    	entities = visit([], entity)      
      
    	renderer.draw()
    } catch (e) {
      node.error = e.message
      console.log(e)
    }
    
    node.comment = 'Entities: ' + entities.length
    if (node.selected) {
      node.comment += '\nTransforms: ' + renderer.getComponents('Transform').length
      node.comment += '\nGeometries: ' + renderer.getComponents('Geometry').length
      node.comment += '\nSkins: ' + renderer.getComponents('Skin').length
      node.comment += '\nMorph: ' + renderer.getComponents('Morph').length
      node.comment += '\nAnimation: ' + renderer.getComponents('Animation').length
      node.comment += '\nMaterials: ' + renderer.getComponents('Material').length
      node.comment += '\nDirectional Lights: ' + renderer.getComponents('DirectionalLight').length
      node.comment += '\nPoint Lights: ' + renderer.getComponents('PointLight').length
      node.comment += '\nSpot Lights: ' + renderer.getComponents('SpotLight').length
      node.comment += '\nArea Lights: ' + renderer.getComponents('AreaLight').length
      node.comment += '\nSkyboxes: ' + renderer.getComponents('Skybox').length  
      node.comment += '\nReflection Probes: ' + renderer.getComponents('ReflectionProbe').length
      node.comment += '\nCameras: ' + renderer.getComponents('Camera').length
    }
    //node.comment += `\n ${renderer.entities[1]}`
    
    var postProcessing = renderer.getComponents('PostProcessing')[0]
    var camera = renderer.getComponents('Camera')[0]
    
    postRenderOut.trigger({
      props,
      frameColorMap: postProcessing._frameColorTex,
      frameDepthMap: postProcessing._frameDepthTex,
      camera
    })
    
    entities.forEach((ent) => {
    	renderer.remove(ent)
    })
    
  
   
    
    // remove top level entities
    //renderer.root.transform.children.forEach((child) => {
    //  renderer.remove(child.entity)
    //})
  }
  
  node.onDestroy = function () {
    graph.renderer = null
    // TODO: Release all resources, but actualy if now Context is
    // a separate node we can just keep everything 
    //renderer.dispose()
  }
  
}