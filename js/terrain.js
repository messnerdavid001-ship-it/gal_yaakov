// The ground: real elevation mesh with contour lines, the cut sides, and the roads laid on top.
import * as THREE from 'three';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';

let terrain, tmat; const roadMeshes = [];
{
  const S = 250, geo = new THREE.PlaneGeometry(1, 1, S, S), pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const c = new THREE.Color(), tan = new THREE.Color(0x9a8a62), green = new THREE.Color(0x5f6b3c), red = new THREE.Color(0x8a5a3c), rock = new THREE.Color(0xb9b3a4), grav = new THREE.Color(0xb7a98a), dark = new THREE.Color(0x4a5433);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) * 2, v = pos.getY(i) * 2;
    const x = u * HALF, n = v * HALF, y = H(x, n);
    pos.setXYZ(i, x, y, -n);
    const f = fbm(x / 60 + 9, n / 60 + 3), f2 = fbm(x / 9, n / 9);
    c.copy(tan).lerp(green, sstep(.35, .7, f)).lerp(rock, sstep(.72, .9, f2) * .5);
    if (olive(x, n)) c.lerp(red, .65);
    if (y < -60) c.lerp(dark, sstep(-60, -160, y) * .5);
    const yard = Math.hypot((x - 20) / 1.6, n + 2);
    if (yard < 32) c.lerp(grav, sstep(32, 20, yard));
    c.multiplyScalar(.88 + f2 * .24);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  tmat = new THREE.MeshLambertMaterial({ vertexColors: true });
  tmat.onBeforeCompile = sh => { sh.uniforms.uContour = contourU;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vH;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = position.y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vH;\nuniform float uContour;')
      .replace('#include <color_fragment>', '#include <color_fragment>\nfloat cc = (vH + 513.5) / 10.0; float cl = 1.0 - min(abs(fract(cc - 0.5) - 0.5) / (fwidth(cc) * 1.4), 1.0); float c5 = (vH + 513.5) / 50.0; float cl5 = 1.0 - min(abs(fract(c5 - 0.5) - 0.5) / (fwidth(c5) * 1.8), 1.0); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.11, 0.07), max(cl * 0.55, cl5 * 0.85) * uContour);'); };
  const t = new THREE.Mesh(geo, tmat); t.receiveShadow = true; scene.add(t); terrain = t;
  // cut sides, so the square reads as a block of ground
  const wv = [], wi = [], BASE = -235;
  for (const [ax, an, bx, bn] of [[-HALF, -HALF, HALF, -HALF], [HALF, -HALF, HALF, HALF], [HALF, HALF, -HALF, HALF], [-HALF, HALF, -HALF, -HALF]]) { const o = wv.length / 3;
    for (let k = 0; k <= 100; k++) { const x = ax + (bx - ax) * k / 100, n = an + (bn - an) * k / 100; wv.push(x, H(x, n), -n, x, BASE, -n); if (k < 100) { const a = o + k * 2; wi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } } }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wv, 3)); wg.setIndex(wi); wg.computeVertexNormals();
  scene.add(new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ color: 0x6f5c47, side: THREE.DoubleSide })));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 2 * HALF), new THREE.MeshBasicMaterial({ color: 0x4f4234 })); fl.rotation.x = Math.PI / 2; fl.position.y = BASE; scene.add(fl);
}
function ribbon(pts, w, color, lift) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, n]) => new THREE.Vector3(x, 0, n))), N = Math.ceil(curve.getLength() / 3), v = [], idx = [];
  for (let i = 0; i <= N; i++) { const p = curve.getPoint(i / N), t = curve.getTangent(i / N), nx = -t.z, nn = t.x;
    for (const s of [-1, 1]) { const x = p.x + nx * s * w / 2, n = p.z + nn * s * w / 2; v.push(x, Math.max(H(x, n), H(p.x, p.z)) + lift, -n); }
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, lam(color, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); m.receiveShadow = true; scene.add(m); roadMeshes.push(m);
}
ROADS.forEach(r => ribbon(r[0], r[1], r[2], r[3]));


export { terrain, tmat, ribbon, roadMeshes };
