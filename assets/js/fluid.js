/**
 * FLUID — GPU Navier–Stokes simulation
 *
 * Standard stable-fluids solver running on the GPU:
 *   advect velocity → compute curl → apply vorticity confinement →
 *   compute divergence → Jacobi-solve pressure → subtract gradient →
 *   advect dye
 *
 * Based on the approach in Pavel Dobryakov's WebGL-Fluid-Simulation
 * (https://github.com/PavelDoGreat/WebGL-Fluid-Simulation, MIT licence).
 *
 * The display pass differs from the usual one: instead of rendering coloured
 * dye, dye density is used as a MASK that reveals a background plate. That is
 * what produces the drifting metallic blob rather than a rainbow smear.
 *
 * Exposes: window.Fluid.{ init, tick, splat, setBackground, setPortrait, setPortraitRect }
 */
(function () {
  'use strict';

  var CFG = {
    SIM_RESOLUTION:       96,
    DYE_RESOLUTION:       384,
    DENSITY_DISSIPATION:  0.988,
    VELOCITY_DISSIPATION: 0.985,
    PRESSURE:             0.80,
    PRESSURE_ITERATIONS:  12,
    CURL:                 12,
    SPLAT_RADIUS:         0.42,
    SPLAT_FORCE:          2600,
  };

  // Phones and small laptops get a cheaper sim — the full one will pin a
  // mobile GPU and tank the whole page.
  (function scaleForDevice() {
    var w = window.innerWidth;
    if (w >= 1200) return;
    if (w < 600)      { CFG.SIM_RESOLUTION = 64;  CFG.PRESSURE_ITERATIONS = 8;  CFG.CURL = 8;  CFG.SPLAT_RADIUS = 0.18; }
    else if (w < 900) { CFG.SIM_RESOLUTION = 96;  CFG.PRESSURE_ITERATIONS = 12; CFG.CURL = 12; CFG.SPLAT_RADIUS = 0.20; }
    else              { CFG.SIM_RESOLUTION = 128; CFG.PRESSURE_ITERATIONS = 16; CFG.CURL = 16; CFG.SPLAT_RADIUS = 0.22; }
  })();

  var canvas, gl, ext;
  var velocity, dye, divergence, curl, pressure;
  var programs = {};
  var blit;
  var bgTexture = null;
  var backgroundURL = null, portraitURLs = null;
  var portraitBase = null, portraitArt = null;
  var portraitRect = [0, 0, 0, 0];
  var backgroundAspect = 1;
  var listenersBound = false;
  var ready = false;

  /* ── Shader sources ──────────────────────────────────────── */

  var VERT = [
    'precision highp float;',
    'attribute vec2 aPosition;',
    'varying vec2 vUv, vL, vR, vT, vB;',
    'uniform vec2 texelSize;',
    'void main() {',
    '  vUv = aPosition * 0.5 + 0.5;',
    '  vL = vUv - vec2(texelSize.x, 0.0);',
    '  vR = vUv + vec2(texelSize.x, 0.0);',
    '  vT = vUv + vec2(0.0, texelSize.y);',
    '  vB = vUv - vec2(0.0, texelSize.y);',
    '  gl_Position = vec4(aPosition, 0.0, 1.0);',
    '}'
  ].join('\n');

  var F_CLEAR = [
    'precision mediump float; precision mediump sampler2D;',
    'varying highp vec2 vUv;',
    'uniform sampler2D uTexture;',
    'uniform float value;',
    'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
  ].join('\n');

  var F_SPLAT = [
    'precision highp float; precision highp sampler2D;',
    'varying vec2 vUv;',
    'uniform sampler2D uTarget;',
    'uniform float aspectRatio;',
    'uniform vec3 color;',
    'uniform vec2 point;',
    'uniform float radius;',
    'void main() {',
    '  vec2 p = vUv - point.xy;',
    '  p.x *= aspectRatio;',
    '  vec3 splat = exp(-dot(p, p) / radius) * color;',
    '  vec3 base = texture2D(uTarget, vUv).xyz;',
    '  gl_FragColor = vec4(base + splat, 1.0);',
    '}'
  ].join('\n');

  var F_ADVECTION = [
    'precision highp float; precision highp sampler2D;',
    'varying vec2 vUv;',
    'uniform sampler2D uVelocity;',
    'uniform sampler2D uSource;',
    'uniform vec2 texelSize;',
    'uniform float dt;',
    'uniform float dissipation;',
    'void main() {',
    // Semi-Lagrangian: trace backwards along velocity and sample there.
    '  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;',
    '  gl_FragColor = dissipation * texture2D(uSource, coord);',
    '  gl_FragColor.a = 1.0;',
    '}'
  ].join('\n');

  var F_DIVERGENCE = [
    'precision mediump float; precision mediump sampler2D;',
    'varying highp vec2 vUv, vL, vR, vT, vB;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uVelocity, vL).x;',
    '  float R = texture2D(uVelocity, vR).x;',
    '  float T = texture2D(uVelocity, vT).y;',
    '  float B = texture2D(uVelocity, vB).y;',
    '  vec2 C = texture2D(uVelocity, vUv).xy;',
    // Reflect velocity at the boundaries so fluid doesn't leak off-screen.
    '  if (vL.x < 0.0) { L = -C.x; }',
    '  if (vR.x > 1.0) { R = -C.x; }',
    '  if (vT.y > 1.0) { T = -C.y; }',
    '  if (vB.y < 0.0) { B = -C.y; }',
    '  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var F_CURL = [
    'precision mediump float; precision mediump sampler2D;',
    'varying highp vec2 vUv, vL, vR, vT, vB;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uVelocity, vL).y;',
    '  float R = texture2D(uVelocity, vR).y;',
    '  float T = texture2D(uVelocity, vT).x;',
    '  float B = texture2D(uVelocity, vB).x;',
    '  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var F_VORTICITY = [
    'precision highp float; precision highp sampler2D;',
    'varying vec2 vUv, vL, vR, vT, vB;',
    'uniform sampler2D uVelocity;',
    'uniform sampler2D uCurl;',
    'uniform float curl;',
    'uniform float dt;',
    'void main() {',
    '  float L = texture2D(uCurl, vL).x;',
    '  float R = texture2D(uCurl, vR).x;',
    '  float T = texture2D(uCurl, vT).x;',
    '  float B = texture2D(uCurl, vB).x;',
    '  float C = texture2D(uCurl, vUv).x;',
    // Push velocity back toward vortex centres — restores the small eddies
    // that numerical diffusion eats.
    '  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));',
    '  force /= length(force) + 0.0001;',
    '  force *= curl * C;',
    '  force.y *= -1.0;',
    '  vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;',
    '  vel = min(max(vel, -1000.0), 1000.0);',
    '  gl_FragColor = vec4(vel, 0.0, 1.0);',
    '}'
  ].join('\n');

  var F_PRESSURE = [
    'precision mediump float; precision mediump sampler2D;',
    'varying highp vec2 vUv, vL, vR, vT, vB;',
    'uniform sampler2D uPressure;',
    'uniform sampler2D uDivergence;',
    'void main() {',
    '  float L = texture2D(uPressure, vL).x;',
    '  float R = texture2D(uPressure, vR).x;',
    '  float T = texture2D(uPressure, vT).x;',
    '  float B = texture2D(uPressure, vB).x;',
    '  float divergence = texture2D(uDivergence, vUv).x;',
    '  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var F_GRADIENT = [
    'precision mediump float; precision mediump sampler2D;',
    'varying highp vec2 vUv, vL, vR, vT, vB;',
    'uniform sampler2D uPressure;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uPressure, vL).x;',
    '  float R = texture2D(uPressure, vR).x;',
    '  float T = texture2D(uPressure, vT).x;',
    '  float B = texture2D(uPressure, vB).x;',
    '  vec2 velocity = texture2D(uVelocity, vUv).xy;',
    '  velocity -= vec2(R - L, T - B);',   // make the field divergence-free
    '  gl_FragColor = vec4(velocity, 0.0, 1.0);',
    '}'
  ].join('\n');

  /* One GPU pass composites the art, portrait and fluid with identical UVs. */
  var F_DISPLAY = [
    'precision highp float; precision highp sampler2D;',
    'varying vec2 vUv;',
    'uniform sampler2D uTexture, uBackground, uPortrait, uArt;',
    'uniform vec3 uTint;',
    'uniform vec2 uEdge, uDyeTexel, uBackgroundScale;',
    'uniform vec4 uPortraitRect;',
    'uniform float uHasBg, uHasPortrait;',
    'void main() {',
    '  float density = texture2D(uTexture, vUv).r;',
    // Estimate coverage at the boundary to avoid a crawling one-texel edge.
    '  float dx = texture2D(uTexture, vUv + vec2(uDyeTexel.x, 0.0)).r - texture2D(uTexture, vUv - vec2(uDyeTexel.x, 0.0)).r;',
    '  float dy = texture2D(uTexture, vUv + vec2(0.0, uDyeTexel.y)).r - texture2D(uTexture, vUv - vec2(0.0, uDyeTexel.y)).r;',
    '  float edge = max((uEdge.y - uEdge.x) * 0.5, length(vec2(dx, dy)) * 0.22);',
    '  float threshold = (uEdge.x + uEdge.y) * 0.5;',
    '  float mask = smoothstep(threshold - edge, threshold + edge, density);',
    '  vec2 bgUv = (vec2(vUv.x, 1.0 - vUv.y) - 0.5) * uBackgroundScale + 0.5;',
    '  vec3 color = uHasBg > 0.5 ? texture2D(uBackground, bgUv).rgb : uTint;',
    '  vec4 result = vec4(color * mask, mask);',
    '  if (uHasPortrait > 0.5) {',
    '    vec2 uv = (vec2(vUv.x, 1.0 - vUv.y) - uPortraitRect.xy) / uPortraitRect.zw;',
    '    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {',
    '      vec4 photo = texture2D(uPortrait, uv);',
    '      vec4 art = texture2D(uArt, uv);',
    // Quiet graphite outside the ink, original coloured portrait inside it.
    '      float graphite = dot(photo.rgb, vec3(0.299, 0.587, 0.114));',
    '      photo.rgb = mix(vec3(graphite) * vec3(1.04, 1.015, 0.99), photo.rgb, 0.24);',
    '      vec4 portrait = mix(photo, art, mask);',
    '      portrait.a *= 1.0 - smoothstep(0.88, 1.0, uv.y);',
    '      result = vec4(portrait.rgb * portrait.a + result.rgb * (1.0 - portrait.a), portrait.a + result.a * (1.0 - portrait.a));',
    '    }',
    '  }',
    '  gl_FragColor = result;',
    '}'
  ].join('\n');

  /* ── GL plumbing ─────────────────────────────────────────── */

  function getContext(c) {
    var params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    var gl2 = c.getContext('webgl2', params);
    var isWebGL2 = !!gl2;
    var g = gl2 || c.getContext('webgl', params) || c.getContext('experimental-webgl', params);
    if (!g) return null;

    var halfFloat, supportLinear;
    if (isWebGL2) {
      if (!g.getExtension('EXT_color_buffer_float')) return null;
      // Textures here are HALF_FLOAT (RGBA16F), and in WebGL2 linear filtering
      // of half-float is CORE — no extension required.
      //
      // Do NOT gate this on OES_texture_float_linear: that extension covers
      // 32-bit float textures, which this solver never creates. Many mobile
      // GPUs omit it, and treating that as "no linear filtering" drops the dye
      // sampler to NEAREST *and* halves dye resolution, which renders the blob
      // as hard pixel squares. Desktop happens to expose it, so the bug only
      // ever showed on phones.
      supportLinear = true;
    } else {
      halfFloat = g.getExtension('OES_texture_half_float');
      if (!halfFloat) return null;
      // WebGL1 genuinely does need the extension for half-float filtering.
      supportLinear = !!g.getExtension('OES_texture_half_float_linear');
    }

    var halfFloatTexType = isWebGL2 ? g.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);

    function fmt(internal, format, type) {
      if (!supportRenderTexture(g, internal, format, type)) {
        if (!isWebGL2) return null;
        if (internal === g.R16F)   return fmt(g.RG16F,   g.RG,   type);
        if (internal === g.RG16F)  return fmt(g.RGBA16F, g.RGBA, type);
        return null;
      }
      return { internalFormat: internal, format: format };
    }

    var formatRGBA = isWebGL2 ? fmt(g.RGBA16F, g.RGBA, halfFloatTexType) : fmt(g.RGBA, g.RGBA, halfFloatTexType);
    var formatRG   = isWebGL2 ? fmt(g.RG16F,   g.RG,   halfFloatTexType) : fmt(g.RGBA, g.RGBA, halfFloatTexType);
    var formatR    = isWebGL2 ? fmt(g.R16F,    g.RED,  halfFloatTexType) : fmt(g.RGBA, g.RGBA, halfFloatTexType);

    if (!formatRGBA || !formatRG || !formatR) return null;

    return {
      gl: g,
      ext: {
        formatRGBA: formatRGBA,
        formatRG: formatRG,
        formatR: formatR,
        halfFloatTexType: halfFloatTexType,
        supportLinearFiltering: supportLinear,
      },
    };
  }

  function supportRenderTexture(g, internalFormat, format, type) {
    var tex = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, tex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    var fbo = g.createFramebuffer();
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
    var ok = g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;

    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.deleteFramebuffer(fbo);
    g.deleteTexture(tex);
    return ok;
  }

  function compile(type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[fluid] shader compile failed:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function Program(fragSource) {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, fragSource);
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'aPosition');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('[fluid] program link failed:', gl.getProgramInfoLog(p));
    }

    // Cache uniform locations up front — looking them up per draw is wasteful.
    var uniforms = {};
    var count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < count; i++) {
      var name = gl.getActiveUniform(p, i).name;
      uniforms[name] = gl.getUniformLocation(p, name);
    }

    return {
      program: p,
      uniforms: uniforms,
      bind: function () { gl.useProgram(p); },
    };
  }

  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture: texture, fbo: fbo, width: w, height: h,
      texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach: function (id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  /** Ping-pong pair — simulation passes read one and write the other. */
  function createDoubleFBO(w, h, internalFormat, format, type, param) {
    var fbo1 = createFBO(w, h, internalFormat, format, type, param);
    var fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w, height: h,
      texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      get read()  { return fbo1; },
      set read(v) { fbo1 = v; },
      get write()  { return fbo2; },
      set write(v) { fbo2 = v; },
      swap: function () { var t = fbo1; fbo1 = fbo2; fbo2 = t; },
    };
  }

  function initBlit() {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    var elem = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elem);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return function (target) {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

  function getResolution(resolution) {
    var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    var min = Math.round(resolution);
    var max = Math.round(resolution * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  function initFramebuffers() {
    var simRes = getResolution(CFG.SIM_RESOLUTION);
    var dyeRes = getResolution(CFG.DYE_RESOLUTION);
    var texType = ext.halfFloatTexType;
    var rgba = ext.formatRGBA, rg = ext.formatRG, r = ext.formatR;
    var filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);
    // Resizing must release all old attachments, including both ping-pong sides.
    [dye, velocity, divergence, curl, pressure].forEach(function (target) {
      if (!target) return;
      (target.read ? [target.read, target.write] : [target]).forEach(function (fbo) {
        gl.deleteTexture(fbo.texture);
        gl.deleteFramebuffer(fbo.fbo);
      });
    });

    dye      = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat,   rg.format,   texType, filtering);
    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  }

  /* ── Simulation ──────────────────────────────────────────── */

  function step(dt) {
    if (!ready) return;
    gl.disable(gl.BLEND);

    // Curl
    programs.curl.bind();
    gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    // Vorticity confinement
    programs.vorticity.bind();
    gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(programs.vorticity.uniforms.curl, CFG.CURL);
    gl.uniform1f(programs.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    // Divergence
    programs.divergence.bind();
    gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // Decay the previous pressure solution — a warm start converges faster
    // than clearing to zero every frame.
    programs.clear.bind();
    gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(programs.clear.uniforms.value, CFG.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    // Jacobi pressure solve
    programs.pressure.bind();
    gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
    for (var i = 0; i < CFG.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // Project velocity to divergence-free
    programs.gradient.bind();
    gl.uniform2f(programs.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.gradient.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(programs.gradient.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // Advect velocity, then dye
    programs.advection.bind();
    gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(programs.advection.uniforms.dt, dt);
    gl.uniform1f(programs.advection.uniforms.dissipation, Math.pow(CFG.VELOCITY_DISSIPATION, dt * 60));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(programs.advection.uniforms.dissipation, Math.pow(CFG.DENSITY_DISSIPATION, dt * 60));
    blit(dye.write);
    dye.swap();

  }

  function render() {
    var cfg = (window.SiteConfig && window.SiteConfig.fluid) || {};

    // Shader writes premultiplied RGBA directly; never blend into old frames.
    gl.disable(gl.BLEND);

    programs.display.bind();
    gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
    gl.uniform3f(
      programs.display.uniforms.uTint,
      (cfg.r != null ? cfg.r : 194) / 255,
      (cfg.g != null ? cfg.g : 194) / 255,
      (cfg.b != null ? cfg.b : 194) / 255
    );
    // The edge window is deliberately narrow (~0.01) to give a crisp blob
    // boundary. That only reads as clean when the dye sampler can interpolate;
    // with NEAREST there is nothing between texels and the boundary steps
    // through whole pixels. Widen it in that case so the mask self-softens.
    var edgeLow  = cfg.edgeLow  != null ? cfg.edgeLow  : 0.08;
    var edgeHigh = cfg.edgeHigh != null ? cfg.edgeHigh : 0.09;
    if (!ext.supportLinearFiltering) edgeHigh = edgeLow + (edgeHigh - edgeLow) * 6;

    gl.uniform2f(programs.display.uniforms.uEdge, edgeLow, edgeHigh);

    if (bgTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.uniform1i(programs.display.uniforms.uBackground, 1);
      gl.uniform1f(programs.display.uniforms.uHasBg, 1);
    } else {
      gl.uniform1f(programs.display.uniforms.uHasBg, 0);
    }

    var aspect = canvas.width / canvas.height;
    gl.uniform2f(programs.display.uniforms.uBackgroundScale,
      aspect < backgroundAspect ? aspect / backgroundAspect : 1,
      aspect > backgroundAspect ? backgroundAspect / aspect : 1);
    gl.uniform2f(programs.display.uniforms.uDyeTexel, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1f(programs.display.uniforms.uHasPortrait, portraitBase && portraitArt ? 1 : 0);
    if (portraitBase && portraitArt) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, portraitBase);
      gl.uniform1i(programs.display.uniforms.uPortrait, 2);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, portraitArt);
      gl.uniform1i(programs.display.uniforms.uArt, 3);
      gl.uniform4fv(programs.display.uniforms.uPortraitRect, portraitRect);
    }
    blit(null);
  }

  /* ── Public API ──────────────────────────────────────────── */

  /** x,y in CSS pixels; dx,dy as a fraction of viewport travelled this frame. */
  function splat(x, y, dx, dy) {
    if (!ready) return;
    gl.disable(gl.BLEND);

    var nx = x / window.innerWidth;
    var ny = 1 - y / window.innerHeight;
    var aspect = canvas.width / canvas.height;

    programs.splat.bind();
    gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(programs.splat.uniforms.aspectRatio, aspect);
    gl.uniform2f(programs.splat.uniforms.point, nx, ny);
    gl.uniform3f(programs.splat.uniforms.color, dx * CFG.SPLAT_FORCE, -dy * CFG.SPLAT_FORCE, 0);
    gl.uniform1f(programs.splat.uniforms.radius, CFG.SPLAT_RADIUS / 100);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(programs.splat.uniforms.color, 0.30, 0.30, 0.30);
    blit(dye.write);
    dye.swap();
  }

  function loadTexture(url, onLoad) {
    var img = new Image();
    img.onload = function () {
      if (!ready || gl.isContextLost()) return;
      var tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      onLoad(tex, img);
    };
    img.onerror = function () { console.warn('[fluid] texture failed to load:', url); };
    img.src = url;
  }

  function setBackground(url) {
    backgroundURL = url;
    if (!ready || !url) return;
    loadTexture(url, function (tex, img) {
      if (bgTexture) gl.deleteTexture(bgTexture);
      bgTexture = tex;
      backgroundAspect = img.naturalWidth / img.naturalHeight;
    });
  }

  function setPortrait(baseURL, artURL) {
    portraitURLs = [baseURL, artURL];
    if (!ready) return;
    function reveal() {
      if (portraitBase && portraitArt) document.body.classList.add('gpu-portrait');
    }
    loadTexture(baseURL, function (tex) {
      if (portraitBase) gl.deleteTexture(portraitBase);
      portraitBase = tex;
      reveal();
    });
    loadTexture(artURL, function (tex) {
      if (portraitArt) gl.deleteTexture(portraitArt);
      portraitArt = tex;
      reveal();
    });
  }

  function setPortraitRect(rect) {
    portraitRect[0] = rect.left / window.innerWidth;
    portraitRect[1] = rect.top / window.innerHeight;
    portraitRect[2] = rect.width / window.innerWidth;
    portraitRect[3] = rect.height / window.innerHeight;
  }

  function resize() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.25, 1600 / window.innerWidth);
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    if (ready) initFramebuffers();
  }

  function init() {
    canvas = document.getElementById('fluidCanvas');
    if (!canvas) return false;

    var got = getContext(canvas);
    if (!got) {
      console.warn('[fluid] WebGL unavailable — background will render without fluid.');
      canvas.style.display = 'none';
      return false;
    }
    gl = got.gl;
    ext = got.ext;

    // Half-float linear filtering missing (older mobile) — drop dye resolution
    // so NEAREST sampling doesn't look blocky.
    if (!ext.supportLinearFiltering) CFG.DYE_RESOLUTION = 256;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.25, 1600 / window.innerWidth);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    blit = initBlit();

    programs.clear      = Program(F_CLEAR);
    programs.splat      = Program(F_SPLAT);
    programs.advection  = Program(F_ADVECTION);
    programs.divergence = Program(F_DIVERGENCE);
    programs.curl       = Program(F_CURL);
    programs.vorticity  = Program(F_VORTICITY);
    programs.pressure   = Program(F_PRESSURE);
    programs.gradient   = Program(F_GRADIENT);
    programs.display    = Program(F_DISPLAY);

    initFramebuffers();
    ready = true;

    if (!listenersBound) {
      listenersBound = true;
      window.addEventListener('resize', resize);
      canvas.addEventListener('webglcontextlost', function (e) {
        e.preventDefault();
        ready = false;
        document.body.classList.remove('gpu-portrait');
      });
      canvas.addEventListener('webglcontextrestored', function () {
        dye = velocity = divergence = curl = pressure = null;
        bgTexture = portraitBase = portraitArt = null;
        if (!init()) return;
        if (backgroundURL) setBackground(backgroundURL);
        if (portraitURLs) setPortrait(portraitURLs[0], portraitURLs[1]);
      });
    }

    return true;
  }

  function tick(dt) {
    if (!ready) return;
    // Use the shared frame clock; decay and motion have the same speed at
    // 60/120Hz. Cap the step after a stall without a costly catch-up spiral.
    var elapsed = Math.min(Math.max(dt || 1 / 60, 0.001), 1 / 30);
    step(elapsed);
    render();
  }

  window.Fluid = {
    init: init,
    tick: tick,
    splat: splat,
    setPortrait: setPortrait,
    setPortraitRect: setPortraitRect,
    setBackground: setBackground,
    get ready() { return ready; },
    config: CFG,
  };
})();
