module.exports = function (node, graph) {
  const quat = require('pex-math').quat
  const toRadians = require('pex-math').utils.toRadians
  
  const renderIn = node.triggerIn('in')
  const renderOut = node.triggerOut('out')
  
  const tags = node.in('tags', '')
  const position = node.in('position', [0, 0, 0])
  const rotation = node.in('rotation', [0, 0, 0])
  const color = node.in('color', [1, 1, 1, 1], { type: 'color' })
  
  const intensity = node.in('intensity', 1, { min: 0, max: 10 })
  const castShadows = node.in('castShadows', true)
  const bias = node.in('bias', 0.1)
  const showGizmo = node.in('showGizmo', true)
  
  const renderer = graph.renderer
  const ctx = graph.ctx
  
  const transformCmp = renderer.transform({
    position: position.value
  })
  
  position.onChange = () => {
    transformCmp.set({ position: position.value })  
  }
  
  rotation.onChange = () => {
    quat.fromEuler(
      transformCmp.rotation,
      rotation.value.map(toRadians)
    )
    transformCmp.set({ rotation: transformCmp.rotation })
  }
  
  var lightCmp = renderer.directionalLight({
    target: [0, 0, 0],
    color: color.value,
    intensity: intensity.value,
    castShadows: castShadows.value,
    bias: bias.value
  })
  
  color.onChange = function () {
    lightCmp.set({
      color: color.value
    })
  }
  
  intensity.onChange = function () {
    lightCmp.set({
      intensity: intensity.value
    })
  }
  
  castShadows.onChange = function () {  
    lightCmp.set({
      castShadows: castShadows.value
    })
  }
  
  bias.onChange = function () {
    lightCmp.set({
      bias: bias.value
    })
  }
  
  const gizmoGeom = renderer.geometry({
    primitive: ctx.Primitive.Lines,
  })
  
  const gizmoMat = renderer.material({  
  })
  
  var lightEnt = renderer.entity([
    transformCmp,
    lightCmp, 
    gizmoGeom,
    gizmoMat
  ])
  
  renderIn.onTrigger = function (props) { 
    if (node.selected !== lightCmp.debug) { 
    	lightCmp.set({ debug: node.selected })
    }
    
    var gizmoIdx = lightEnt.components.indexOf(gizmoGeom)  
    if ((node.selected || showGizmo.value) && props.pexHelpers) {
      if (gizmoIdx === -1) {
      	lightEnt.addComponent(gizmoGeom)
      }    
      var lines = props.pexHelpers.directionalLightGizmo()
      gizmoGeom.set({
        positions: lines,
        count: lines.length
      })
    } else if (gizmoIdx !== -1) {
      lightEnt.removeComponent(gizmoGeom)
    }
      
    var entity = [lightEnt]
    props.parentEntity.push(entity)
    var newProps = Object.assign({}, props, {
      parentEntity: entity
    })
    renderOut.trigger(newProps)
  }
  
  tags.onChange = function () {
    lightEnt.tags = tags.value ? tags.value.split(' ') : []
  }
  
  
}