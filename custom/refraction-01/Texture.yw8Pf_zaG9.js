module.exports = function (node, graph) {
  var ctx = graph.ctx
  
  var url = node.in( 'url', '', { type: 'asset', thumbnails: true })
  const tex = ctx.texture2D({
      pixelFormat: ctx.PixelFormat.RGBA8,
      encoding: ctx.Encoding.SRGB,
      flipY: true,
    	wrap : ctx.Wrap.ClampToEdge
    })
  var texture = node.out('texture out', tex)
  
  url.onChange = function () {
    processImg()
  }
  
  function processImg(){
  	var textureImage = new Image()
    textureImage.src = url.value
    textureImage.onerror = function (e) {
      console.log('error', e)
    }
    textureImage.onload = function () {
      ctx.update(tex, {
        data: textureImage,
        width: textureImage.width,
        height: textureImage.height,
        mipmap: false,
        //min: ctx.Filter.LinearMipmapLinear
        min: ctx.Filter.Linear
      })
      node.commentImage = textureImage
    }
    texture.setValue(tex)
  }
  processImg();
}