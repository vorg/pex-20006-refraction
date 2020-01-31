module.exports = function (node, graph) {
  var renderIn = node.triggerIn('in')
  var renderOut = node.triggerOut('out')
  var changed = node.triggerOut('changed')
  var sunPosition = node.in('sunPosition', [5, 5, 5])
  var texture = node.in('texture')
  var diffuseTexture = node.in('diffuseTexture')
  var backgroundBlur = node.in('backgroundBlur', false)
  var renderer = graph.renderer
  
  var sky = renderer.skybox({
    sunPosition: sunPosition.value
  })
  
  sunPosition.onChange = function () {
    sky.set({
      sunPosition: sunPosition.value
    })
  	setTimeout(() => changed.trigger(), 100)
  }
  
  texture.onChange = function () {
    //if (!texture.value) return 
    sky.set({
      texture: texture.value
    })
    setTimeout(() => changed.trigger(), 100)
  }
  
  diffuseTexture.onChange = function () {
    //if (!diffuseTexture.value) return 
    sky.set({
      diffuseTexture: diffuseTexture.value
    })
    setTimeout(() => changed.trigger(), 100)
  }
  
  backgroundBlur.onChange = function () {
    sky.set({
      backgroundBlur: backgroundBlur.value
    })
  }
  
  
  var skyboxEnt = renderer.entity([ sky ])
  
  var prevTex = null
  
  renderIn.onTrigger = function (props) {
    var entity = [skyboxEnt]
    props.parentEntity.push(entity)
    var newProps = Object.assign({}, props, {
      parentEntity: entity
    })
    renderOut.trigger(newProps)
  }
  
  
  
  
}