module.exports = (node, graph) => {
  const { renderer } = graph

const fragDefHook = `varying vec3 vPositionView;`
const fragDefMod = `varying vec3 vPositionView;
`

const depthFragHook = `getBaseColor(data);`
const depthFragMod = `getBaseColor(data);`

const fragHook = `data.linearRoughness = data.roughness * data.roughness;`
const fragMod = `data.linearRoughness = data.roughness * data.roughness;`

const fragOutHook = `gl_FragData[0] = encode(vec4(color, 1.0), uOutputEncoding);`
const fragOutMod = `
//color = vec3(ao) * data.baseColor;
//color -= data.emissiveColor;
//color = data.directColor;
color *= vec3(ao);
color *= vec3(ao);
//color += data.emissiveColor * (1.0 - ao);

gl_FragData[0] = encode(vec4(color, 1.0), uOutputEncoding);
gl_FragData[1] = encode(vec4(color, 1.0), uOutputEncoding);
`

const directionalLightHook = `void EvaluateDirectionalLight(inout PBRData data, DirectionalLight light, sampler2D shadowMap) {
  vec4 lightViewPosition = light.viewMatrix * vec4(vPositionWorld, 1.0);
  float lightDistView = -lightViewPosition.z;
  vec4 lightDeviceCoordsPosition = light.projectionMatrix * lightViewPosition;
  vec3 lightDeviceCoordsPositionNormalized = lightDeviceCoordsPosition.xyz / lightDeviceCoordsPosition.w;
  vec2 lightUV = lightDeviceCoordsPositionNormalized.xy * 0.5 + 0.5;

  float illuminated = bool(light.castShadows) ? getShadow(shadowMap, light.shadowMapSize, lightUV, lightDistView - light.bias, light.near, light.far) : 1.0;

  if (illuminated > 0.0) {
    Light l;
    l.l = -light.direction;
    l.color = light.color;
    l.attenuation = 1.0;
    getSurfaceShading(data, l, illuminated);
  }
}`

const directionalLightMod = `
uniform sampler2D uSSSMap;
void EvaluateDirectionalLight(inout PBRData data, DirectionalLight light, sampler2D shadowMap) {
  vec4 lightViewPosition = light.viewMatrix * vec4(vPositionWorld, 1.0);
  float lightDistView = -lightViewPosition.z;
  vec4 lightDeviceCoordsPosition = light.projectionMatrix * lightViewPosition;
  vec3 lightDeviceCoordsPositionNormalized = lightDeviceCoordsPosition.xyz / lightDeviceCoordsPosition.w;
  vec2 lightUV = lightDeviceCoordsPositionNormalized.xy * 0.5 + 0.5;
  float illuminated = bool(light.castShadows) ? getShadow(shadowMap, light.shadowMapSize, lightUV, lightDistView - light.bias, light.near, light.far) : 1.0;
  if (illuminated > 0.0) {
    Light l;
    l.l = -light.direction;
    l.color = light.color;
    l.attenuation = 1.0;
    getSurfaceShading(data, l, illuminated);
  }

  vec3 N = data.normalWorld;
  vec3 L = normalize(-light.direction);
        
  float NdotL = saturate(dot(N, L));
        
  float lightToSurfaceDistance = readDepth(shadowMap, lightUV, light.near, light.far);
  // float lightToSurfaceDistance1 = readDepth(shadowMap, lightUV + vec2(0.0, 1.0 / 1024.0), light.near, light.far);
  // float lightToSurfaceDistance2 = readDepth(shadowMap, lightUV, light.near, light.far);
  // lightToSurfaceDistance = (lightToSurfaceDistance + lightToSurfaceDistance1) / 2.0;
  float thickness = max(0.0, lightDistView - lightToSurfaceDistance + 0.0);
  vec3 sssColor = texture2D(uSSSMap, vec2(clamp(thickness / 2.0, 0.0, 1.0), 0.5)).rgb;
  // sssColor = pow(sssColor, vec3(2.2));
  // sssColor = vec3(0.0);
  if (thickness < 0.01) {
    //sssColor = vec3(0.0);
    // vec3 sssColor = texture2D(uSSSMap, vec2(1.0 - NdotL, 0.5)).rgb;
    // data.directColor = mix(data.directColor, sssColor, 1.0 - NdotL);
    // data.directColor = vec3(1.0, 0.0, 0.0);
  } else {
    // data.directColor = vec3(thickness);
  }
  //data.directColor = vec3(thickness * 10.0);
  // data.directColor *= 0.0;
  //data.directColor += sssColor.rgb * vec3(1.0, 1.0, 0.0);
  data.directColor = data.diffuseColor * sssColor * (1.0 - NdotL);
  // data.directColor += data.diffuseColor * sssColor;// * (1.0 - NdotL);
  //data.directColor = data.diffuseColor * sssColor;// * vec3(clamp(1.0 - NdotL, 0.0, 1.0));
  //data.directColor = vec3(thickness);
}`


  const vert = `
#ifdef DEPTH_PRE_PASS_ONLY
${renderer.shaders.pipeline.depthPrePass.vert}
#elif defined DEPTH_PASS_ONLY
${renderer.shaders.pipeline.depthPass.vert}
#else
${renderer.shaders.pipeline.material.vert}
#endif
`
	const frag = `
#ifdef DEPTH_PRE_PASS_ONLY
${renderer.shaders.pipeline.depthPrePass.frag}
#elif defined DEPTH_PASS_ONLY
${renderer.shaders.pipeline.depthPass.frag}
#else
${renderer.shaders.pipeline.material.frag
  .replace(fragDefHook, fragDefMod)
  .replace(directionalLightHook, directionalLightMod)
  // .replace(fragHook, fragMod)
  .replace(fragOutHook, fragOutMod)
}
#endif
`
  
  console.log(frag)
  
  node.out('vert', vert)
	node.out('frag', frag)
	
}