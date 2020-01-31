module.exports = (node, graph) => {
  var geometryIn = node.in('geometry')
  var instancesIn = node.in('instances')
  var geometryOut = node.out('geometryOut')
  
  function update() {
    if (!geometryIn.value) return
    if (!instancesIn.value) return
    
    var g = Object.assign({}, geometryIn.value, instancesIn.value)
    geometryOut.setValue(g)
  }
  
  geometryIn.onChange = update
  instancesIn.onChange = update
}