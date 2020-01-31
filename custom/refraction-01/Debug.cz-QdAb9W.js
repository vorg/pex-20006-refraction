module.exports = function (node, graph) {
  const canvasScreenshot = require('canvas-screenshot')
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  
  const ctx = graph.ctx
  
  let debugNextFrame = false
  const debugBtn = node.in('debug next frame', () => {
    debugNextFrame = true
  })
  
  var frame = 0
  triggerIn.onTrigger = (props) => {
    if (debugNextFrame) {
      ctx.debug(true)
    }
    
    triggerOut.trigger(props)
    
    if (debugNextFrame) {
      debugNextFrame = false
      ctx.debug(false)
    }
  }
  
}