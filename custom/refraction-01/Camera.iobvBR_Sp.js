module.exports = function (node, graph) {
  var vec3 = require('pex-math').vec3
  var mat4 = require('pex-math').mat4
  var quat = require('pex-math').quat
  var euler = require('pex-math').euler
  var toDegrees = require('pex-math').utils.toDegrees
  var toRadians = require('pex-math').utils.toRadians
  
  var ctx = graph.ctx
  var renderer = graph.renderer
  
  var renderIn = node.triggerIn('in')
  var renderOut = node.triggerOut('out')
  var tags = node.in('tags', '', { connectable: false })
  
  const position = node.in('position', [0, 2, 5])
  const rotation = node.in('rotation', [-30, 0, 0])
  
  const resetView = node.in('resetView', () => {
    cameraEnt.getComponent('Orbiter').set({ position: [0, 20, 0.01] })
  })
  
  const transformCmp = renderer.transform({
    position: position.value
  })
  
  position.onChange = () => {
    console.log('camera position set ' + position.value)
    transformCmp.set({ position: position.value })
    cameraEnt.getComponent('Orbiter').set({ position: position.value })
  }
                     
  rotation.onChange = () => {
    console.log('camera rotation set ' + rotation.value)  
    quat.fromEuler(
      transformCmp.rotation,
      rotation.value.map(toRadians)
    )
    transformCmp.set({ rotation: transformCmp.rotation })
  }
  
  var backgroundColor = node.in('backgroundColor', [0, 0, 0, 1], {
    connectable: false,
    type: 'color'
  })
  var fov = node.in('fov', toDegrees(Math.PI / 4), { connectable: false })
  var near = node.in('near', 1, { connectable: false })
  var far = node.in('far', 100, { connectable: false })
  var viewport = node.in('viewport', [0, 0, 1, 1], { connectable: false })
  const showGizmo = node.in('showGizmo', false, { connectable: false })
  
  var exposure = node.in('exposure', 1, { connectable: false })
  var postprocess = node.in('postprocess', true, { connectable: false })
  var fxaa = node.in('fxaa', true, { connectable: false })
  
  var ssao = node.in('ssao', true, { connectable: false })
  var ssaoIntensity = node.in('ssaoIntensity', 5, {
    connectable: false,
    precision: 2,
    min: 0,
    max: 20
  })
  
  var ssaoRadius = node.in('ssaoRadius', 12, {
    connectable: false,
    precision: 1,
    min: 0,
    max: 10
  })
  
  var ssaoBias = node.in('ssaoBias', 0.01, {
    connectable: false,
    precision: 3,
    min: 0,
    max: 1
  })
  
  var ssaoBlurRadius = node.in('ssaoBlurRadius', 2, {
    connectable: false,
    // precision: 0,
    min: 0,
    max: 2
  })
  
  var ssaoBlurSharpness = node.in('ssaoBlurSharpness', 10, {
    connectable: false,
    precision: 0,
    min: 0,
    max: 20
  })
  
  var bloom = node.in('bloom', false, { connectable: false })
  var bloomThreshold = node.in('bloomThreshold', 1, {
    connectable: false,
    precision: 2,
    min: 0,
    max: 2
  })
  var bloomIntensity = node.in('bloomIntensity', 1, {
    connectable: false,
    precision: 2,
    min: 0,
    max: 1
  })
  var bloomRadius = node.in('bloomRadius', 1, {
    connectable: false,
    precision: 2,
    min: 0,
    max: 5
  })
  
  var dof = node.in('DoF', false, { connectable: false })  
  // var dofRadius = node.in('dofRadius', 1, {
  //   connectable: false,
  //   precision: 2,
  //   min: 0.001,
  //   max: 5
  // })
  var fStop = node.in('fStop', 3, {
    connectable: false,
    precision: 2,
    min: 0.1,
    max: 10
  })
  var dofFocusDistance = node.in('dofFocusDistance', 3, {
    connectable: false,
    precision: 2,
    min: 0,
    max: 10
  })
  
  
  var fog = node.in('fog', false, { connectable: false })
  var sunDispertion = node.in('sunDispertion', 0.2, {
    connectable: false,
    precision: 3,
    min: 0.001,
    max: 0.5
  })
  var sunIntensity = node.in('sunIntensity', 0.1, {
    connectable: false,
    precision: 3,
    min: 0.001,
    max: 0.5
  })
  
  
  var inscatteringCoeffs = node.in('inscatteringCoeffs', [0.3, 0.3, 0.3], {
    connectable: false,
    type: 'color'
  })
  var fogColor = node.in('fogColor', [0.5, 0.5, 0.5], {
    connectable: false,
    type: 'color'
  })
  var fogStart = node.in('fogStart', 5, {
    connectable: false,
    precision: 0,
    min: 1,
    max: 1000
  })
  var fogDensity = node.in('fogDensity', 0.15, {
    connectable: false,
    precision: 3,
    min: 0,
    max: 1
  })
  
  var cameraCmp = renderer.camera({
    backgroundColor: backgroundColor.value,
    postprocess: postprocess.value,
    bloom: bloom.value,
    bloomRadius: bloomRadius.value,
    fxaa: fxaa.value,
    ssao: ssao.value,
    dof: dof.value,
    fog: fog.value,
    sunDispertion: sunDispertion.value,
    sunIntensity: sunIntensity.value,
    inscatteringCoeffs: inscatteringCoeffs.value.slice(0, 3),
    fogColor: fogColor.value.slice(0, 3),
    fogStart: fogStart.value,
    fogDensity: fogDensity.value,
    sunPosition: [5, 5, 5], // TODO should come from sun
    ssaoIntensity: ssaoIntensity.value,
   	ssaoRadius: ssaoRadius.value,
    ssaoBias: ssaoBias.value,
    ssaoBlurRadius: ssaoBlurRadius.value,
    ssaoBlurSharpness: ssaoBlurSharpness.value,
    exposure: exposure.value,
    depthPrepass: true,
    fStop: fStop.value
  })
  
  var postProcessingCmp = renderer.postProcessing({
    backgroundColor: backgroundColor.value,
    postprocess: postprocess.value,
    bloom: bloom.value,
    bloomRadius: bloomRadius.value,
    fxaa: fxaa.value,
    ssao: ssao.value,
    dof: dof.value,
    fog: fog.value,
    sunDispertion: sunDispertion.value,
    sunIntensity: sunIntensity.value,
    inscatteringCoeffs: inscatteringCoeffs.value.slice(0, 3),
    fogColor: fogColor.value.slice(0, 3),
    fogStart: fogStart.value,
    fogDensity: fogDensity.value,
    sunPosition: [5, 5, 5], // TODO should come from sun
    ssaoIntensity: ssaoIntensity.value,
   	ssaoRadius: ssaoRadius.value,
    ssaoBias: ssaoBias.value,
    ssaoBlurRadius: ssaoBlurRadius.value,
    ssaoBlurSharpness: ssaoBlurSharpness.value,
    dofFocusDistance: dofFocusDistance.value,
    exposure: exposure.value,
    depthPrepass: true
  })
  
  function onChange () {
    var val = {
      //backgroundColor: backgroundColor.value,
      near: near.value,
      far: far.value,
      fov: toRadians(fov.value),
      postprocess: postprocess.value,
      bloom: bloom.value,
      bloomThreshold: bloomThreshold.value,
      bloomIntensity: bloomIntensity.value,
      bloomRadius: bloomRadius.value,
      fxaa: fxaa.value,
      ssao: ssao.value,
      dof: dof.value,
      fog: fog.value,
      sunDispertion: sunDispertion.value,
      sunIntensity: sunIntensity.value,
      inscatteringCoeffs: inscatteringCoeffs.value.slice(0, 3),
      fogColor: fogColor.value.slice(0, 3),
      fogStart: fogStart.value,
      fogDensity: fogDensity.value,
      ssaoIntensity: ssaoIntensity.value,
      ssaoRadius: ssaoRadius.value,
      ssaoBias: ssaoBias.value,
      ssaoBlurRadius: ssaoBlurRadius.value,
      ssaoBlurSharpness: ssaoBlurSharpness.value,
      fStop: fStop.value,
      dofFocusDistance: dofFocusDistance.value,
      exposure: exposure.value,
      depthPrepass: postprocess.value
    }
    cameraCmp.set(val)
    postProcessingCmp.set(val)
  }
  
  fov.onChange = onChange
  near.onChange = onChange
  far.onChange = onChange
  exposure.onChange = onChange
  postprocess.onChange = onChange
  bloom.onChange = onChange
  bloomThreshold.onChange = onChange
  bloomIntensity.onChange = onChange
  bloomRadius.onChange = onChange
  fxaa.onChange = onChange
  ssao.onChange = onChange
  dof.onChange = onChange
  fog.onChange = onChange
  sunDispertion.onChange = onChange
  sunIntensity.onChange = onChange
  inscatteringCoeffs.onChange = onChange
  fogColor.onChange = onChange
  fogStart.onChange = onChange
  fogDensity.onChange = onChange
  ssaoIntensity.onChange = onChange
  ssaoRadius.onChange = onChange
  ssaoBias.onChange = onChange
  ssaoBlurRadius.onChange = onChange
  ssaoBlurSharpness.onChange = onChange
  fStop.onChange = onChange
  dofFocusDistance.onChange = onChange
  
  const gizmoGeom = renderer.geometry({
    primitive: ctx.Primitive.Lines,
  })
  
  const gizmoMat = renderer.material({  
    baseColor: [1, 1, 0, 1]
  })
  
  var cameraEnt = renderer.entity([
    cameraCmp,
    postProcessingCmp,
    transformCmp,
    gizmoGeom,
    gizmoMat,
    renderer.orbiter({ position: [0, 0, 5], element: ctx.gl.canvas })
  ], tags.value.split(' '))
  
  tags.onChange = function () {
    cameraEnt.tags = tags.value ? tags.value.split(' ') : []
  }
  
  var rot = [0, 0, 0]
  var rotDeg = [0, 0, 0]
  renderIn.onTrigger = function (props) {
    if (!vec3.equals(position.value, transformCmp.position)) {
      vec3.set(position.value, transformCmp.position)
    }
    euler.fromQuat(rot, transformCmp.rotation)
    rotDeg[0] = toDegrees(rot[0])
    rotDeg[1] = toDegrees(rot[1])
    rotDeg[2] = toDegrees(rot[2])
    if (!vec3.equals(rotation.value, rotDeg)) {
      vec3.set(rotation.value, rotDeg)
    }  
    
    if (ctx && (ctx.gl.drawingBufferWidth.width !== cameraCmp.viewport[2] || ctx.gl.drawingBufferHeight !== cameraCmp.viewport[3])) {
      var v = viewport.value
      var view = [
        ctx.gl.drawingBufferWidth * v[0],
        ctx.gl.drawingBufferHeight * v[1],
        ctx.gl.drawingBufferWidth * v[2],
        ctx.gl.drawingBufferHeight * v[3]
      ]
      
      cameraCmp.set({
        viewport: view
      })
    }
    
    var gizmoIdx = cameraEnt.components.indexOf(gizmoGeom)  
    if ((node.selected || showGizmo.value) && props.pexHelpers) {
      if (gizmoIdx === -1) {
      	cameraEnt.addComponent(gizmoGeom)
      }    
      var lines = props.pexHelpers.perspectiveCameraGizmo(cameraCmp)
      gizmoGeom.set({
        positions: lines,
        count: lines.length
      })
    } else if (gizmoIdx !== -1) {
      cameraEnt.removeComponent(gizmoGeom)
    }
      
    var entity = [cameraEnt]
    props.parentEntity.push(entity)
    var newProps = Object.assign({}, props, {
      parentEntity: entity
    })
    renderOut.trigger(newProps)
  }
  
  console.log('camera position ' + position.value)
  
}