module.exports = function(node, graph) {
  const createRoundedCube = require("primitive-rounded-cube");
  const R = require('ramda')
  const random = require('pex-random')

  const rIn = node.in("r", 0.5);
  const segmentsIn = node.in("segments", 16, { precision: 0, min: 8, max: 64 });

  var geometry = node.out("geometry");

  function update() {
    random.seed(3)
    const r = rIn.value
    const segments = segmentsIn.value
    var geom = createRoundedCube(r, r, r, 20, 20, 20, 0.1)
    geom.offsets = R.range(0, 20).map(() => {
      var v = random.vec3(4)
      v[1] += 1
      return v
    })
    geometry.setValue(geom);
  }

  rIn.onChange = update;
  segmentsIn.onChange = update;
  
  update()
};

