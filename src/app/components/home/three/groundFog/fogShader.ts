import * as THREE from "three";

export const fogVertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fogFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFogHeight;
  uniform float uNoiseScale;
  uniform float uNoiseSeed;
  uniform float uNoiseSpeed;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  // Simplex 3D Noise
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 =   v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod(i, 289.0);
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
  
  // FBM (Fractal Brownian Motion) for more natural fog
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    // Animated noise for fog movement
    vec3 noisePos = vec3(vUv * 200.0 * uNoiseScale, 0.0);
    noisePos.xy += vec2(uNoiseSeed, uNoiseSeed * 0.37);
    noisePos.xy += vec2(
      uTime * uNoiseSpeed * 0.3,
      uTime * uNoiseSpeed * 0.2
    );
    noisePos.z = uTime * uNoiseSpeed * 0.5;
    
    // Multiple layers of noise for depth
    float noise1 = fbm(noisePos);
    float noise2 = fbm(noisePos * 2.0 + vec3(100.0));
    float combinedNoise = (noise1 + noise2 * 0.5) * 0.5 + 0.5;
    
    
    
    // Edge fade based on UV (soft edges)
    float edgeFade = smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x);
    edgeFade *= smoothstep(0.0, 0.02, vUv.y) * smoothstep(1.0, 0.98, vUv.y);
    
    // Combine all factors
    float fogAmount = combinedNoise * edgeFade * uFogDensity;
    
    // Final opacity
    float alpha = fogAmount * uOpacity;
    
    // Add slight color variation based on noise
    vec3 finalColor = uFogColor + vec3(noise1 * 0.05);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const createFogMaterial = (options?: {
  fogColor?: THREE.Color;
  fogDensity?: number;
  fogHeight?: number;
  noiseScale?: number;
  noiseSeed?: number;
  noiseSpeed?: number;
  opacity?: number;
}) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: options?.fogColor ?? new THREE.Color("#8899aa") },
      uFogDensity: { value: options?.fogDensity ?? 0.8 },
      uFogHeight: { value: options?.fogHeight ?? 10.0 },
      uNoiseScale: { value: options?.noiseScale ?? 0.02 },
      uNoiseSeed: { value: options?.noiseSeed ?? 0.0 },
      uNoiseSpeed: { value: options?.noiseSpeed ?? 0.5 },
      uOpacity: { value: options?.opacity ?? 0.6 },
    },
    vertexShader: fogVertexShader,
    fragmentShader: fogFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
};
