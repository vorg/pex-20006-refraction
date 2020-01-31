module.exports = function (node, graph) {
  var renderIn = node.triggerIn('in')
  var renderOut = node.triggerOut('out')
  var origin = node.in('origin', [0, 0, 0])
  var size = node.in('size', [10, 10, 10])
  var needsUpdate = node.triggerIn('update')
  
  var renderer = graph.renderer
  
  node.ports = [renderIn, renderOut, needsUpdate, origin, size]
  
  var reflectionProbe = renderer.reflectionProbe({
      origin: origin.value,
      size: size.value,
      boxProjection: false
  })
  
  origin.onChange = function () {
    reflectionProbe.set({
      origin: origin.value
    })
  }
  
  size.onChange = function () {
    reflectionProbe.set({
      size: size.value
    })
  }
  
  needsUpdate.onTrigger = function () {
    console.log('dirty', true)
    reflectionProbe.dirty = true
  }
  
  var reflectionProbeEnt = renderer.entity([ reflectionProbe ])
  
  renderIn.onTrigger = function (props) {
     var entity = [reflectionProbeEnt]
    props.parentEntity.push(entity)
    var newProps = Object.assign({}, props, {
      parentEntity: entity
    })
    renderOut.trigger(newProps)
  }
  
  
  
}