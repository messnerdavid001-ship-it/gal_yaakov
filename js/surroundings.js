// Army post and the houses of Al-Hossa / Deir Nidham, from satellite imagery.
import * as THREE from 'three';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';

/* ---------- surroundings ---------- */
// army post on the ridge north of Road 465 (crest at 543 m), laid out from the satellite image
[[-77, 484, 36, 16], [-47, 462, 20, 50], [-20, 473, 24, 54], [-80, 440, 18, 24]].forEach(([cx, cn, w, d]) => {
  if (w > d) for (let n = cn - d / 2 + 2; n < cn + d / 2; n += 6) put(box(w, 2.8, 4.2, 0xf0efe9), cx, n, 0);
  else for (let x = cx - w / 2 + 2; x < cx + w / 2; x += 6) put(box(4.2, 2.8, d, 0xf0efe9), x, cn, 0); });
{ const v = []; for (let k = 0; k < 48; k++) { const a0 = k / 48 * 6.2832, a1 = (k + 1) / 48 * 6.2832, p0 = P(-59 + Math.cos(a0) * 70, 462 + Math.sin(a0) * 60, 2.2), p1 = P(-59 + Math.cos(a1) * 70, 462 + Math.sin(a1) * 60, 2.2);
    v.push(...p0.toArray(), ...p1.toArray(), p0.x, p0.y - 2.2, p0.z, p0.x, p0.y, p0.z); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); scene.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x5d6164 }))); }
[[-30, 500, 18], [-95, 470, 22], [-60, 425, 12]].forEach(([x, n, h]) => put(box(.25, h, .25, 0x7c8084), x, n));
{ const t = box(2.5, 6, 2.5, 0x8d9296); put(t, 2, 432); put(box(3.2, 1.6, 3.2, 0x9a927d), 2, 432, 0, 6); }
// houses of Al-Hossa and the edge of Deir Nidham
HOUSES.forEach(([x, n, big]) => put(box(big ? 20 : 10 + rnd() * 3, big ? 5 : 3.5 + rnd() * 3.5, big ? 13 : 9 + rnd() * 2, rnd() < .6 ? 0xeeeae0 : 0xdcd4c2), x, n, Math.floor(rnd() * 4) * .4));
{ const v = [], pts = [[488, -321], [528, -253], [566, -271], [551, -346], [488, -321]]; for (let i = 0; i < 4; i++) v.push(...P(pts[i][0], pts[i][1], 1.5).toArray(), ...P(pts[i + 1][0], pts[i + 1][1], 1.5).toArray());
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); scene.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x2c2c2c }))); }
