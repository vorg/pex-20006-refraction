module.exports = function(node, graph) {
  const createRoundedCube = require("primitive-rounded-cube");
  const R = require('ramda')
  const random = require('pex-random')

  const xIn = node.in("x", 0.5);
  const yIn = node.in("y", 0.5);
  const zIn = node.in("z", 0.5);
  const segmentsIn = node.in("segments", 16, { precision: 0, min: 8, max: 64 });

  var geometry = node.out("geometry");

  function update() {
    const x = xIn.value
    const y = yIn.value
    const z = zIn.value
    const segments = segmentsIn.value
    var geom = createRoundedCube(x, y, z, 20, 20, 20, 0.1)   
    geometry.setValue(geom);
  }

  xIn.onChange = update;
  yIn.onChange = update;
  zIn.onChange = update;
  segmentsIn.onChange = update;
  
  update()
};

