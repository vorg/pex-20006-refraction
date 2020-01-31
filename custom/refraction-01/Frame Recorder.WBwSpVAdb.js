module.exports = function (node, graph) {
  const canvasScreenshot = require('canvas-screenshot')
  
  const triggerIn = node.triggerIn('in')
  const triggerOut = node.triggerOut('out')
  const fpsIn = node.in('fps', 30, { precision: 0, connectable: false })
  const durationIn = node.in('duration (s)', 10)    
  
  let recording = false
  let recordingStartDate = null
  let time = 0 //TODO: time vs totalTime?
  let frame = 0
  let totalFrames = 0
  let prevResolution
  
  const { ctx } = graph
  
  const resolutionIn = node.in('resolution', '', {
    type: 'dropdown', values: [], connectable: false
  })
  
  const startStopRecordingBtn = node.in('start / stop recording', () => {
    if (!recording) startRecording()
    else stopRecording()
  })
  
  const takeScreenshotBtn = node.in('take screenshot', () => {
    if (!recording) takeScreenshot()
  })
  
  function startRecording () {
    const fps = fpsIn.value
    const duration = durationIn.value
      
    time = 0
    frame = 0
    totalFrames = duration * fps
    recording = true    
    recordingStartDate = new Date()
  }
  
  function takeScreenshot () {
    startRecording()
    totalFrames = 1
  }
  
  function stopRecording () {
    recording = false
  }
  
  function getScreenshotName(date) {    
	  const fileName = `${graph.name} ${date.toISOString().slice(0, 10)} at ${date
      .toTimeString()
      .slice(0, 8)
      .replace(/:/g, ".")}.png`
    return fileName
  }
  
  function getFrameName(frame) {
    return ('00000' + frame).substr(-5) + '.png'
  }
  
  function getFolderName(date) {
    const YYYYMMDD = date.toISOString().slice(0, 10).replace(/-/g, '')
    const mmhhss = date.toTimeString().slice(0, 8).replace(/:/g, '')
    const folderName = `frames/${graph.name}-${YYYYMMDD}-${mmhhss}`
    return folderName
  }
  
  function uploadFile (blob, fileName, folderName) {
    var formData = new window.FormData()
    formData.append('filepath', folderName)
    formData.append('file', blob, fileName)    
    var postReq = new window.XMLHttpRequest()
    postReq.open('POST', 'asset')
    postReq.send(formData)
  }
  
  triggerIn.onTrigger = async (props) => {
    if (resolutionIn.options.values !== props.contextResolutions) {
      resolutionIn.options.values = props.contextResolutions || []
    }    
    if (recording) {
      if (!prevResolution) {
        prevResolution = props.getContextResolution()
        props.setContextResolution(resolutionIn.value)
    	}
      const fps = fpsIn.value
      const duration = durationIn.value
      
      const deltaTime = 1 / fps
      time += deltaTime
            
      triggerOut.trigger({
        ...props,
        time,
        deltaTime
      })            
      
      // const blob = await 
      if (totalFrames == 1) {
        canvasScreenshot(ctx.gl.canvas, {
          useBlob: true,
          filename: getScreenshotName(recordingStartDate)
        })        
      } else {
        const blob = await canvasScreenshot(ctx.gl.canvas, {
          useBlob: true,
          download: false          
        })  
        uploadFile(blob, getFrameName(frame), getFolderName(recordingStartDate)) 
      }
      
      if (++frame >= totalFrames) {
        stopRecording()
      }      

      if (recording) { // still recording after await resolved
      	node.comment = `Recording:
Time: ${time.toFixed(1)} / ${duration}
Frame: ${frame} / ${totalFrames}`
      }
    } else {      
      triggerOut.trigger(props)
      if (prevResolution) {
        props.setContextResolution(prevResolution)
        prevResolution = null
         if (totalFrames > 1) {
           node.comment = `Exported frames to:\nassets/${getFolderName(recordingStartDate)}`
         } else {
           node.comment = `Recording: false`
         }
      }
    }
  }
}