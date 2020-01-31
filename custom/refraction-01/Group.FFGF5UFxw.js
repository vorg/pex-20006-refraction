module.exports = function (node, graph) {
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  
  triggerIn.onTrigger = (props) => {
    triggerOut.trigger(props)
  }
  
}