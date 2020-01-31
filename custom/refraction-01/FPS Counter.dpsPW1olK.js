module.exports = (node, graph) => {
  var triggerIn = node.triggerIn('in')
  var triggerOut = node.triggerOut('out')

  const tIn = node.in('t', 0)
  const enabledIn = node.in('enabled', true)

  var div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.left = '0px'
  div.style.top = '0px'
  div.style.background = '#FFFFFF'
  div.style.padding = '2px'
  div.style.lineHeight = '150%'
  div.innerText = 'bla'

  enabledIn.onChange = (enabled) => {
    if (div) {
      if (enabled) {
        div.style.display = 'block'
      } else {
        div.style.display = 'none'
      }
    }
  }

  node.onReady = () => {
    graph.sceneContainer.appendChild(div)
  }

  node.onDestroy = () => {
    if (div.parentElement) {
      div.parentElement.removeChild(div)
    }
  }

  var prevTime = 0
  var time = 0
  var fpsCount = 0
  var fps = 0
  var frameTime = 0

  triggerIn.onTrigger = (props) => {
    var now = Date.now()
    if (!prevTime) prevTime = now
    var deltaTime = now - prevTime
    time += deltaTime / 1000
    prevTime = now
    fpsCount++

    if (time > 1) {
      fps = fpsCount
      fpsCount = 0
      time -= 1
    }

    triggerOut.trigger(props)
    var frameTime = Date.now() - now

    div.innerHTML = `Frame Time: ${frameTime}<br/>RAF Time: ${deltaTime}<br/>FPS: ${fps}<br/>T: ${tIn.value.toFixed(
      2
    )}`
  }
}
