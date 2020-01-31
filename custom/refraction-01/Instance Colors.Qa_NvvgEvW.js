module.exports = (node, graph) => {
  const random = require("pex-random");
  const instancesOut = node.out("instances");
  const { vec3 } = require('pex-math')
  const { fromHex } = require("pex-color");
  const seedIn = node.in('seed', 0)
  const triggerIn = node.triggerIn('trigger')

  const dutchPalette = [
    "#FFC312",
    "#F79F1F",
    "#EE5A24",
    "#EA2027",
    "#C4E538",
    "#A3CB38",
    "#009432",
    "#006266",
    "#12CBC4",
    "#1289A7",
    "#0652DD",
    "#1B1464",
    "#FDA7DF",
    "#D980FA",
    "#9980FA",
    "#5758BB",
    "#ED4C67",
    "#B53471",
    "#833471",
    "#6F1E51"
  ].map(fromHex);

  var MAX_DEPTH = 20;
  
  var data = []

  function rebuild() {
    random.seed(seedIn.value);

    function divide(parent, rects) {
      rects.push(parent);

      var depth = parent[4];

      var shouldDivide = random.chance(0.1 + 1 / (depth * 0.5 + 1));
      if (depth <= 1) {
        shouldDivide = true;
      }

      if (depth >= MAX_DEPTH || !shouldDivide) {
        return rects;
      }

      var numDivisions = random.int(2, 6);
      var horizontal = random.chance(0.5);
      if (depth == 0) horizontal = false;
      if (depth == 1) horizontal = true;

      for (var i = 0; i < numDivisions; i++) {
        var child = null;
        if (horizontal) {
          child = [
            parent[0] + (parent[2] * i * 1) / numDivisions,
            parent[1],
            (parent[2] * 1) / numDivisions,
            parent[3],
            depth + 1
          ];
        } else {
          child = [
            parent[0],
            parent[1] + (parent[3] * i * 1) / numDivisions,
            parent[2],
            (parent[3] * 1) / numDivisions,
            depth + 1
          ];
        }
        var offset = 0.002;
        child[0] += offset;
        child[1] += offset;
        child[2] -= 2 * offset;
        child[3] -= 2 * offset;
        divide(child, rects);
      }
      return rects;
    }

    var rects = divide([-2, -1, 4, 2, 0], []);

    var depth = 0.05;
    var R = 1
    var r = 0.2
    var offsets = rects.map(o => {
      var a = random.float(0, Math.PI * 2)
      var pos = [R * Math.cos(a), 0, R * Math.sin(a)]
      vec3.addScaled(pos, random.vec3(), r)
      return pos
      // return random.vec3()
      // return [r[0] + r[2]/2, r[4] * depth + random.int(0, 20) * depth + random.float(0, 0.01), r[1] + r[3]/2]
      return [o[0] + o[2] / 2, o[4] * depth, o[1] + o[3] / 2];
    });

    var scales = rects.map(r => {
      return [1, 1, 1]
      return [r[2], depth, r[3]];
    });

    // var colors = rects.map((r) => {
    //   if (random.chance(0.437)) {
    //   	return [1.5, 1.5, 1.5, 1]
    //   } else if (random.chance(0.9)) {
    //     return [1.5, 1.2, 0, 1]
    //   }else {
    //     var r = random.float()
    //     var g = random.float()
    //     var b = random.float()
    //     var sum = r + g + b
    //     sum *= 0.5
    //     // sum = 0.5
    //     return [
    //       r / sum,
    //       g / sum,
    //       b / sum,
    //       1
    //     ]
    //   }
    // })

    var colors = rects.map(r => {      
      if (random.chance(0.6)) {
        // return [1, 0.6, 0.8, 1];
        return [1, 1, 1, 1];
        return random.element(dutchPalette);
        // return dutchPalette[0]
        // return [0, 0, 0, 1];
      } else {
        // return [0, 0, 0, 1];
        // return dutchPalette[0]
        return random.element(dutchPalette);
      }
    });
    
    node.comment = '' + offsets.length
    
    data = {
      offsets: { data: offsets, divisor: 1 },
      scales: { data: scales, divisor: 1 },
      colors: { data: colors, divisor: 1 },
      instances: offsets.length
    }

    instancesOut.setValue(data);
  }
  
  triggerIn.onTrigger = (props) => {
    instancesOut.setValue({
      ...data,
      offsets: { data: data.offsets.data.map((o, i) => {
        var r = 0.8 + 0.2 * Math.sin(props.time * 2 + i)
        return [o[0] * r, o[1] * r, o[2] * r]
      }), divisor: 1 },    
      scales: { data: data.offsets.data.map((o, i) => {
        var s = 0.5 + 0.5 * Math.sin(props.time * 2 + i)
        return [s, s, s]
      }), divisor: 1 }, 
    });
  }

  rebuild();
  seedIn.onChange = rebuild;
};
