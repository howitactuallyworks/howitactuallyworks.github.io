var a={cast:{scale:2.2,bump:.35,rough:.18,lines:0},machined:{scale:1.6,bump:.03,rough:.06,lines:1},brushed:{scale:1.2,bump:.09,rough:.12,lines:1},forged:{scale:1.4,bump:.12,rough:.12,lines:0}},m=`
varying vec3 vFinishPos;
float fHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float fNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(fHash(i), fHash(i + vec3(1, 0, 0)), f.x), mix(fHash(i + vec3(0, 1, 0)), fHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(fHash(i + vec3(0, 0, 1)), fHash(i + vec3(1, 0, 1)), f.x), mix(fHash(i + vec3(0, 1, 1)), fHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fFbm(vec3 p) { return 0.55 * fNoise(p) + 0.3 * fNoise(p * 2.1 + 7.3) + 0.15 * fNoise(p * 4.3 + 1.7); }
`;function l(n,f="cast",c={}){let o={...a[f],...c},i=n.onBeforeCompile;return n.onBeforeCompile=(e,s)=>{i&&i(e,s),e.uniforms.fScale={value:o.scale},e.uniforms.fBump={value:o.bump},e.uniforms.fRough={value:o.rough},e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vFinishPos;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vFinishPos = position;`);let r=o.lines?"vFinishPos * vec3(fScale * 0.3, fScale * 5.0, fScale * 0.3)":"vFinishPos * fScale";e.fragmentShader=e.fragmentShader.replace("#include <common>",`#include <common>
uniform float fScale, fBump, fRough;
${m}`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
        float fH = fFbm(${r});
        roughnessFactor = clamp(roughnessFactor * (1.0 + fRough * (2.0 * fFbm(vFinishPos * fScale * 0.15) - 1.0)) , 0.04, 1.0);`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        {   // bump from the height fH, by screen-space derivatives (no tangents needed)
          vec3 dpx = dFdx(-vViewPosition), dpy = dFdy(-vViewPosition);
          float dhx = dFdx(fH), dhy = dFdy(fH);
          vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
          float det = dot(dpx, r1);
          vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
          normal = normalize(abs(det) * normal - fBump * 0.15 * grad);
        }`)},n.customProgramCacheKey=()=>`finish-${f}-${o.lines}`,n.needsUpdate=!0,n}export{l as a};
