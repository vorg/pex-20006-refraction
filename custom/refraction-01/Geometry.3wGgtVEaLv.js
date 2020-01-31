module.exports = function (node, graph) {
  const createCube = require('primitive-cube')
  const quat = require('pex-math').quat
  const toRadians = require('pex-math').utils.toRadians
  
  
  var renderIn = node.triggerIn('in')
  var renderOut = node.triggerOut('out')
  
  
  var cube = createCube(1, 1, 1, 3, 3, 3)
  
  const position = node.in('position', [0, 0, 0])
  const rotation = node.in('rotation', [0, 0, 0])
  const scale = node.in('scale', [1, 1, 1])
  
  var geometry = node.in('geometry', null)
  var tags = node.in('tags', '')
  
  geometry.setValue(cube)
  
  var renderer = graph.renderer
  
  var transformCmp = renderer.transform({})
  
  position.onChange = () => {
    transformCmp.set({ position: position.value })
  }
  
  scale.onChange = () => {
    transformCmp.set({ scale: scale.value })
  }
  
  rotation.onChange = () => {
    quat.fromEuler(
      transformCmp.rotation,
      rotation.value.map(toRadians)
    )
    transformCmp.set({ rotation: transformCmp.rotation })
  }
  
  var geometryCmp = renderer.geometry(geometry.value)
  
  var materialCmp = renderer.material({
    baseColor: [1, 1, 1, 1.0],
    roughness: 0.1,
    metallic: 0
  })
  
  geometry.onChange = function () {
    if (!geometry.value) return
    geometryCmp.set(geometry.value)
  }
  
  geometry.setValue(cube)
  
  var geometryEnt = renderer.entity([
    transformCmp,
    geometryCmp,
    materialCmp
  ])
  
  tags.onChange = function () {
    geometryEnt.tags = tags.value ? tags.value.split(' ') : []
  }
  
  renderIn.onTrigger = function (props) {
    materialCmp.set(props.material)
    geometryCmp.set({
      primitive: props.material.primitive
    })
    renderer.add(geometryEnt)
    
    var entity = [geometryEnt]
    props.parentEntity.push(entity)
    var newProps = Object.assign({}, props, {
      parentEntity: entity
    })
    renderOut.trigger(newProps)
  }
  
  
}