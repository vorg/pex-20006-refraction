module.exports = (node, graph) => {
  const uSSSMapIn = node.in('uSSSMap')
  const uniforms = {}
  const uniformsOut = node.out('uniforms', uniforms)
  
  uSSSMapIn.onChange = () => {
    uniforms.uSSSMap = uSSSMapIn.value
    uniformsOut.setValue(uniforms)
  }
}