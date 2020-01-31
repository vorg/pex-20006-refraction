module.exports = function (node, graph) {
  var loadBinary = require('pex-io').loadBinary
  var parseHdr = require('parse-hdr')
  var changed = node.triggerOut('changed')
  var ctx = graph.ctx
  
  var url = node.in('url', '', { type: 'asset', filter: /\.hdr$/ })
  var tex = ctx.texture2D({
    width: 1,
    height: 1,
    encoding: ctx.Encoding.Linear,
    pixelFormat: ctx.PixelFormat.RGBA32F,
    min: ctx.Filter.Linear,
  	mag: ctx.Filter.Linear  
  })
  var texture = node.out('texture', tex, { type: 'object' })
  
  url.onChange = function () {
    loadBinary(url.value, (err, data) => {
      var img = parseHdr(data)    
      for (var i = 0; i < img.data.length; i++) {
        img.data[i] *= 0.15
      }
      ctx.update(tex, { width: img.shape[0], height: img.shape[1], data: img.data, flipY: true })
      tex.data = null
      
      node.comment = `${url.value}\n${img.shape[0]}x${img.shape[1]}`
      
    	setTimeout(() => changed.trigger(), 100)
    })
  }
  
  node.ports = [texture, url, changed]
  
  
  
}