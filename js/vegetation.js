// Olives, pines, cypress, scrub and rocks.
import * as THREE from 'three';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';

/* ---------- vegetation and rocks (instanced) ---------- */
function scatter(geo, mat, items, shadow) { items = items.filter(t => Math.abs(t[0]) < 985 && Math.abs(t[1]) < 985); const im = new THREE.InstancedMesh(geo, mat, items.length), d = new THREE.Object3D();
  items.forEach((t, i) => { d.position.copy(P(t[0], t[1], t[3] || 0)); d.scale.set(t[2], t[2] * (t[4] || 1), t[2]); d.rotation.y = rnd() * 6; d.updateMatrix(); im.setMatrixAt(i, d.matrix); if (t[5]) im.setColorAt(i, t[5]); });
  im.castShadow = !!shadow; im.receiveShadow = false; scene.add(im); veg.push(im); return im; }
const clear = (x, n) => !(x > -108 && x < -82 && n > -30 && n < -14) && !(x > 10 && x < 66 && n > -84 && n < -64) && Math.hypot(x + 215, n - 23) > 45 && !nearRoad(x, n) && !(x > -70 && x < 110 && n > -50 && n < 58) && Math.hypot((x + 59) / 72, (n - 462) / 62) > 1 && HOUSES.every(h => Math.hypot(x - h[0], n - h[1]) > 14);
{ // olives on terraces
  const it = [], c1 = new THREE.Color(0x6f7d55), c2 = new THREE.Color(0x58683f);
  for (let x = -330; x < 180; x += 9) for (let n = -150; n < 152; n += 9) { const px = x + (rnd() - .5) * 5, pn = n + (rnd() - .5) * 4; if (olive(px, pn) && clear(px, pn) && rnd() > .12) it.push([px, pn, 1.6 + rnd() * .9, 1.2, .8, c1.clone().lerp(c2, rnd())]); }
  for (let i = 0; i < 700; i++) { const x = -980 + rnd() * 1960, n = -980 + rnd() * 1960; if (!olive(x, n) && clear(x, n) && fbm(x / 160, n / 160) > .52 && H(x, n) > -150 && H(x, n) < 20) it.push([x, n, 1.8 + rnd() * 1.2, 1.3, .8, c1.clone().lerp(c2, rnd())]); }
  scatter(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ flatShading: true }), it, true);
}
{ // pines on the viewpoint hill's north side, the post hill and scattered slopes
  const it = [], c1 = new THREE.Color(0x3f6a35), c2 = new THREE.Color(0x56873b);
  const add = (cx, cn, sx, sn, k) => { for (let i = 0; i < k; i++) { const x = cx + (rnd() - .5) * sx, n = cn + (rnd() - .5) * sn; if (clear(x, n) && !olive(x, n) && Math.hypot(x + 200, n - 22) > 50 && !(x < -200 && Math.abs(n - 22) < 70)) it.push([x, n, 1.3 + rnd() * 1.1, 0, 2 + rnd() * .8, c1.clone().lerp(c2, rnd())]); } };
  add(-240, 180, 90, 150, 90); add(-160, 485, 80, 130, 70); add(45, 445, 60, 70, 35); add(-560, -430, 380, 300, 160);
  const geo = new THREE.ConeGeometry(1, 2, 7); geo.translate(0, 1, 0); scatter(geo, new THREE.MeshLambertMaterial({ flatShading: true }), it, true);
}
{ // cypress by the neighbouring homes
  const it = []; for (let i = 0; i < 30; i++) { const x = 60 + rnd() * 200, n = -260 + rnd() * 140; it.push([x, n, 1.1, 0, 5 + rnd() * 2, new THREE.Color(rnd() < .15 ? 0xb9a437 : 0x2f4a2c)]); }
  const geo = new THREE.ConeGeometry(1, 2, 8); geo.translate(0, 1, 0); scatter(geo, new THREE.MeshLambertMaterial(), it, true);
}
{ // dry scrub and limestone
  const sc = [], rk = [], a = new THREE.Color(0xa39466), b = new THREE.Color(0x6e7445), r1 = new THREE.Color(0xcfc9ba), r2 = new THREE.Color(0xa9a08c);
  for (let i = 0; i < 5200; i++) { const rr = Math.pow(rnd(), 1.6) * 650, t = rnd() * 6.283, x = -60 + Math.cos(t) * rr, n = 20 + Math.sin(t) * rr; if (!clear(x, n) && !(Math.hypot(x - 20, n) > 40)) continue; if (distPoly(x, n, road1) < 5.5 || Math.hypot(x + 200, n - 22) < 6 || distPoly(x, n, paved) < 6 || (x > -10 && x < 62 && n > -20 && n < 14)) continue;
    if (rnd() < .78) sc.push([x, n, .35 + rnd() * .6, .1, .7, a.clone().lerp(b, rnd())]); else rk.push([x, n, .2 + rnd() * .55, 0, .6, r1.clone().lerp(r2, rnd())]); }
  scatter(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ flatShading: true }), sc, false);
  scatter(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ flatShading: true }), rk, true);
}
{ // a few sheep in the pen
  const it = []; for (let i = 0; i < 9; i++) it.push([-45 + rnd() * 12, 24 + rnd() * 16, .45, .5, .8, new THREE.Color(i % 4 ? 0xeeeadf : 0x2b2b2b)]);
  scatter(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshLambertMaterial(), it, true); veg.pop();
}
