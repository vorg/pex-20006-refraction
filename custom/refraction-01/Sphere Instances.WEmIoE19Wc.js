module.exports = function(node, graph) {
  const createSphere = require("primitive-sphere");
  const R = require('ramda')
  const random = require('pex-random')

  const rIn = node.in("r", 0.5);
  const segmentsIn = node.in("segments", 16, { precision: 0, min: 8, max: 64 });

  var geometry = node.out("geometry");

  function update() {
    random.seed(10)
    const r = rIn.value
    const segments = segmentsIn.value
    var geom = createSphere(r, { segments: segments })
    geom.offsets = R.range(0, 20).map(() => {
      var v = random.vec3(3)
      v[1] += 1
      return v
    })
    geometry.setValue(geom);
  }

  rIn.onChange = update;
  segmentsIn.onChange = update;
  
  update()
};

