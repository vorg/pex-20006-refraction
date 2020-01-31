module.exports = function (node, graph) {
  var ctx = graph.ctx

  var createSphere = require('primitive-sphere')

  var r = node.in('r', 1)
  

  var geometry = node.out('geometry')

  function update () {
    var g = createSphere(r.value, {
      segments: 16
    })
    console.log('g', g)
    geometry.setValue(g)
  }

  update()

  r.onChange = update
  
}

