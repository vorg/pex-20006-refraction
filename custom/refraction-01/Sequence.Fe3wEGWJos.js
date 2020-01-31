module.exports = function (node, graph) {
  const triggerIn = node.triggerIn('in')
  const triggerOut1 = node.triggerOut('out1')
  const triggerOut2 = node.triggerOut('out2')
  const triggerOut3 = node.triggerOut('out3')
  
  triggerIn.onTrigger = (props) => {
    triggerOut1.trigger(props)
    triggerOut2.trigger(props)
    triggerOut3.trigger(props)
  }
  
}