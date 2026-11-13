// Sky dome, sun and lighting.
import * as THREE from 'three';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';

/* ---------- sky, sun, light ---------- */
{
  const geo = new THREE.SphereGeometry(5000, 32, 16), pos = geo.attributes.position, col = [], top = new THREE.Color(0x3f74c9), mid = new THREE.Color(0x8fb4e6), low = new THREE.Color(HAZE), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const t = Math.max(0, pos.getY(i) / 5000); c.copy(low).lerp(mid, sstep(0, .18, t)).lerp(top, sstep(.15, .8, t)); col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })));
}
const az = 112 * Math.PI / 180, el = 17 * Math.PI / 180;
const sunDir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az) * -1 * -1).normalize(); // east and a little south
{
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,245,1)'); gr.addColorStop(.18, 'rgba(255,240,200,.9)'); gr.addColorStop(.5, 'rgba(255,220,150,.25)'); gr.addColorStop(1, 'rgba(255,220,150,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), fog: false, depthWrite: false, transparent: true }));
  s.scale.setScalar(1300); s.position.copy(sunDir).multiplyScalar(4500); scene.add(s);
}
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x8a7a55, 1.25));
const sun = new THREE.DirectionalLight(0xffe2b0, 2.3); sun.position.copy(sunDir).multiplyScalar(400); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -170, right: 170, top: 170, bottom: -170, near: 50, far: 900 }); sun.shadow.bias = -0.0015;
scene.add(sun, sun.target);
