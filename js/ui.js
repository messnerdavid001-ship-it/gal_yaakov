// Camera controls, contour numbers, satellite layer and the render loop.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';
import { terrain, tmat, roadMeshes } from './terrain.js';
import { placeLabels } from './pins.js';

const tmp = new THREE.Vector3();
/* ---------- camera, views ---------- */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - 0.02; controls.minDistance = 4; controls.maxDistance = 3600; controls.zoomSpeed = .9;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
controls.autoRotate = !reduce; controls.autoRotateSpeed = .35;
const views = {
  overview: [P(-500, -1500, 0).setY(950), P(0, 0, 0).setY(-60)],
  hilltop: [P(-198, 22, 2.6), P(20, 10, 2)],
  yard: [P(-46, 2, 1.8), P(40, 6, 2.2)],
  bench: [P(-234, 25, 3.2), P(-1000, 120, 0).setY(-50)],
  road: [P(40, 405, 4), P(-40, 30, 2)],
};
let tween = null;
function go(name, instant) { const [p, t] = views[name]; controls.autoRotate = name === 'overview' && !reduce;
  if (instant || reduce) { camera.position.copy(p); controls.target.copy(t); tween = null; } else tween = { p0: camera.position.clone(), t0: controls.target.clone(), p, t, s: performance.now() };
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === name)); }
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));
controls.addEventListener('start', () => { controls.autoRotate = false; tween = null; document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', 'false')); });
// numbers on the 400 m and 500 m contour lines
const ctrNums = new THREE.Group(); scene.add(ctrNums);
for (const lev of [400, 500]) { const y = lev - Z0, pts = [], chosen = [];
  for (let n = -940; n <= 940; n += 20) for (let x = -940; x < 940; x += 20) { const a = H(x, n) - y, b = H(x + 20, n) - y; if (a * b < 0) pts.push([x + 20 * a / (a - b), n]); }
  for (const p of pts) if (chosen.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) > 300)) chosen.push(p);
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 80; const c2 = cv.getContext('2d'); c2.font = '600 46px sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.lineWidth = 9; c2.strokeStyle = 'rgba(20,14,8,.9)'; c2.strokeText(lev + ' m', 96, 42); c2.fillStyle = '#fff4d6'; c2.fillText(lev + ' m', 96, 42);
  const mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, sizeAttenuation: false, fog: false, depthTest: false });
  for (const p of chosen) { const s = new THREE.Sprite(mat); s.scale.set(.072, .03, 1); s.position.copy(P(p[0], p[1], 4)); ctrNums.add(s); } }
const ctrbtn = document.getElementById('ctrbtn'); ctrbtn.addEventListener('click', () => { contourU.value = contourU.value ? 0 : 1; ctrNums.visible = !!contourU.value; ctrbtn.setAttribute('aria-pressed', !!contourU.value); });
// satellite photo draped on the ground, where the browser is allowed to load it (the public web link; not inside Claude)
// Satellite layer: the real photo draped on the ground. It is fetched the first time the button is pressed,
// drawn unlit (the photo already has its own light and shadow), and replaces the drawn roads and trees while on.
const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=35.0899,31.9958,35.1111,32.0138&bboxSR=4326&imageSR=4326&size=2048,1739&format=jpg&f=image';
const satbtn = document.getElementById('satbtn'), attr = document.getElementById('attr'); let satMat = null, satOn = false, satState = 'idle';
function setSat(on) { satOn = on; terrain.material = on ? satMat : tmat; veg.forEach(v => v.visible = !on); roadMeshes.forEach(m => m.visible = !on); satbtn.setAttribute('aria-pressed', on); attr.hidden = !on; }
satbtn.hidden = false;
satbtn.addEventListener('click', () => {
  if (satState === 'ready') return setSat(!satOn);
  if (satState !== 'idle') return;
  satState = 'loading'; satbtn.textContent = 'Loading…';
  new THREE.TextureLoader().setCrossOrigin('anonymous').load(SAT_URL, tex => {
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    satMat = new THREE.MeshBasicMaterial({ map: tex }); satMat.onBeforeCompile = tmat.onBeforeCompile;
    renderer.initTexture(tex); satState = 'ready'; satbtn.textContent = 'Satellite'; setSat(true);
  }, undefined, () => { satState = 'failed'; satbtn.textContent = 'Satellite unavailable'; satbtn.disabled = true; });
});
document.getElementById('more').addEventListener('click', () => document.getElementById('card').classList.toggle('open'));
go('overview', true);

const needle = document.getElementById('needle'); let W = 0, Hh = 0;
function frame() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (w !== W || h !== Hh) { W = w; Hh = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix(); }
  if (tween) { const k = Math.min(1, (performance.now() - tween.s) / 1600), e = k * k * (3 - 2 * k); camera.position.lerpVectors(tween.p0, tween.p, e); controls.target.lerpVectors(tween.t0, tween.t, e); if (k >= 1) tween = null; }
  controls.update();
  const ground = H(camera.position.x, -camera.position.z) + 1.2; if (camera.position.y < ground) camera.position.y = ground;
  camera.getWorldDirection(tmp); needle.style.transform = `rotate(${(-Math.atan2(tmp.x, -tmp.z) * 180 / Math.PI).toFixed(1)}deg)`;
  renderer.render(scene, camera); placeLabels(w, h);
  requestAnimationFrame(frame);
}
frame();
