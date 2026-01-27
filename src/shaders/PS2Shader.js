/**
 * PS2-Era Visual Shader
 * Mimics early 2000s graphics with:
 * - Slight color banding
 * - Subtle scanlines
 * - Vignette effect
 * - Color tinting towards the Pracuj.pl palette
 */

import * as THREE from 'three';

export const PS2Shader = {
  name: 'PS2Shader',

  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    scanlineIntensity: { value: 0.08 },
    vignetteIntensity: { value: 0.3 },
    colorBanding: { value: 32.0 }, // Color levels (lower = more banding)
    blueTint: { value: 0.05 } // Pracuj blue tint
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec2 resolution;
    uniform float scanlineIntensity;
    uniform float vignetteIntensity;
    uniform float colorBanding;
    uniform float blueTint;

    varying vec2 vUv;

    // Pracuj.pl Blue: #0046AB = rgb(0, 70, 171) / 255 = (0.0, 0.275, 0.671)
    const vec3 pracujBlue = vec3(0.0, 0.275, 0.671);

    // Color banding (posterization) to mimic limited color depth
    vec3 posterize(vec3 color, float levels) {
      return floor(color * levels) / levels;
    }

    // Scanline effect
    float scanline(float y, float time) {
      float scanlineY = y * resolution.y;
      float line = sin(scanlineY * 3.14159 * 2.0) * 0.5 + 0.5;
      return mix(1.0, line, scanlineIntensity);
    }

    // Vignette effect
    float vignette(vec2 uv) {
      vec2 center = uv - 0.5;
      float dist = length(center);
      return 1.0 - smoothstep(0.4, 0.8, dist) * vignetteIntensity;
    }

    // Subtle chromatic aberration
    vec3 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
      float r = texture2D(tex, uv + vec2(amount, 0.0)).r;
      float g = texture2D(tex, uv).g;
      float b = texture2D(tex, uv - vec2(amount, 0.0)).b;
      return vec3(r, g, b);
    }

    // Film grain
    float grain(vec2 uv, float time) {
      return fract(sin(dot(uv + time * 0.001, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // Subtle chromatic aberration
      vec3 color = chromaticAberration(tDiffuse, uv, 0.001);

      // Color banding (PS2 limited color depth)
      color = posterize(color, colorBanding);

      // Apply subtle blue tint (Pracuj branding)
      color = mix(color, color + pracujBlue * 0.1, blueTint);

      // Scanlines
      float scan = scanline(uv.y, time);
      color *= scan;

      // Vignette
      float vig = vignette(uv);
      color *= vig;

      // Subtle film grain
      float grainAmount = 0.03;
      color += (grain(uv, time) - 0.5) * grainAmount;

      // Slight contrast boost
      color = (color - 0.5) * 1.1 + 0.5;

      // Clamp final color
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

/**
 * Glitch Shader for Rewind Effect
 */
export const GlitchShader = {
  name: 'GlitchShader',

  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    intensity: { value: 0.0 },
    resolution: { value: new THREE.Vector2(1, 1) }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform vec2 resolution;

    varying vec2 vUv;

    const vec3 pracujBlue = vec3(0.0, 0.275, 0.671);

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // Horizontal glitch offset
      float glitchStrength = intensity * 0.1;
      float lineNoise = step(0.8, random(vec2(floor(uv.y * 20.0), time)));
      uv.x += lineNoise * glitchStrength * (random(vec2(time)) - 0.5);

      // RGB split
      float rgbSplit = intensity * 0.02;
      vec3 color;
      color.r = texture2D(tDiffuse, uv + vec2(rgbSplit, 0.0)).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, uv - vec2(rgbSplit, 0.0)).b;

      // Blue tint during rewind (digital/data effect)
      color = mix(color, pracujBlue, intensity * 0.3);

      // Scanline enhancement during glitch
      float scanline = sin(uv.y * resolution.y * 0.5) * 0.5 + 0.5;
      color *= mix(1.0, scanline, intensity * 0.3);

      // Random block corruption
      vec2 blockUv = floor(uv * 10.0) / 10.0;
      float blockNoise = step(0.95 - intensity * 0.1, random(blockUv + time));
      color = mix(color, pracujBlue, blockNoise * intensity);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
