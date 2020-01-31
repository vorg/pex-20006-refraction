module.exports = function (node, graph) {
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const textureOut = node.out('texture')
  
  let passCmd = null
  const ctx = graph.ctx
  triggerIn.onTrigger = (props) => {
    if (!passCmd) {
      console.log('props', props, passCmd)
      passCmd = {
        pass: ctx.pass({
           depth: props.frameDepthMap,
         	 color: [props.frameColorMap]
        })        
      }      
    }
    textureOut.setValue(props.frameColorMap)
    // textureOut.setValue(props.frameColorMapCopy)
    
    ctx.submit(passCmd, () => {
      triggerOut.trigger(props)
    })
  }  
}