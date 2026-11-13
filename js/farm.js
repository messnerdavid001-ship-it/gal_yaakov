// The farm itself: barn, silo, containers, caravans, cars, playground, bench. Placed from photos.
import * as THREE from 'three';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';

/* ---------- farm structures ---------- */
// arched sheep barn, long axis east–west, open canopy at the west end
{
  const grp = new THREE.Group(), L = 30, W = 11, R = 5.5;
  const walls = box(L, 2.6, W, 0xf1f0ea); walls.position.x = 4; grp.add(walls);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L + 8, 24, 1, true, 0, Math.PI), lam(0xe9e6dc, { side: THREE.DoubleSide }));
  roof.rotation.z = Math.PI / 2; roof.position.set(0, 2.6, 0); roof.castShadow = true; grp.add(roof);
  const er = new THREE.Mesh(new THREE.CircleGeometry(R, 24, 0, Math.PI), lam(0xf1f0ea, { side: THREE.DoubleSide })); er.rotation.y = Math.PI / 2; er.position.set(19, 2.6, 0); grp.add(er);
  for (const z of [-R, R]) for (const x of [-18.5, -14]) { const p = box(.15, 2.6, .15, 0x8d9296); p.position.set(x, 0, z); grp.add(p); }
  put(grp, -12, 30, 0.12);
}
// pens: fence lines around the barn
{
  const v = [], rect = (x0, n0, x1, n1) => { const c = [[x0, n0], [x1, n0], [x1, n1], [x0, n1], [x0, n0]];
    for (let i = 0; i < 4; i++) for (let k = 0; k < 6; k++) { const a = k / 6, b = (k + 1) / 6, ax = c[i][0] + (c[i + 1][0] - c[i][0]) * a, an = c[i][1] + (c[i + 1][1] - c[i][1]) * a, bx = c[i][0] + (c[i + 1][0] - c[i][0]) * b, bn = c[i][1] + (c[i + 1][1] - c[i][1]) * b;
      for (const y of [.6, 1.3]) { v.push(...P(ax, an, y).toArray(), ...P(bx, bn, y).toArray()); } v.push(...P(ax, an, 0).toArray(), ...P(ax, an, 1.4).toArray()); } };
  rect(-48, 20, -30, 44); rect(-30, 38, 8, 52); rect(-52, 46, -34, 58);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); scene.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x6f7376 })));
}
// feed silo with flag
{
  const grp = new THREE.Group(), steel = lam(0xa9adb0);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 3.6, 20), steel); body.position.y = 6.6;
  const hop = new THREE.Mesh(new THREE.CylinderGeometry(1.7, .25, 2.6, 20), steel); hop.position.y = 3.5;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75, .9, 20), steel); cap.position.y = 8.85;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, .8, 20, 1, true), lam(0x1f7a55)); band.position.y = 7.6;
  grp.add(body, hop, cap, band);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, leg = box(.14, 5, .14, 0x8d9296); leg.position.set(Math.cos(a) * 1.75, 0, Math.sin(a) * 1.75); grp.add(leg); }
  const pole = box(.06, 3, .06, 0x333333); pole.position.set(0, 9.2, 0); grp.add(pole);
  const fc = document.createElement('canvas'); fc.width = 220; fc.height = 160; const x = fc.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 220, 160); x.fillStyle = '#0038b8'; x.fillRect(0, 18, 220, 24); x.fillRect(0, 118, 220, 24);
  x.strokeStyle = '#0038b8'; x.lineWidth = 6; for (const s of [1, -1]) { x.beginPath(); x.moveTo(110, 80 - 32 * s); x.lineTo(110 + 28, 80 + 16 * s); x.lineTo(110 - 28, 80 + 16 * s); x.closePath(); x.stroke(); }
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(fc), side: THREE.DoubleSide })); flag.position.set(1.1, 11.4, 0); grp.add(flag);
  grp.traverse(o => o.isMesh && (o.castShadow = true)); put(grp, 4, 17);
}
// containers, hut, caravans
function container(c, text) { const m = box(12.2, 2.6, 2.44, c);
  if (text) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 110; const x = cv.getContext('2d'); x.fillStyle = '#2f8f6d'; x.fillRect(0, 0, 512, 110); x.fillStyle = '#e9efe9'; x.font = 'bold 54px sans-serif'; x.textAlign = 'center'; x.fillText(text, 256, 74);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(12.2, 2.6), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) })); pl.position.set(0, 1.3, 1.23); m.add(pl); const p2 = pl.clone(); p2.rotation.y = Math.PI; p2.position.z = -1.23; m.add(p2); } return m; }
put(container(0x2f8f6d, 'CHINA SHIPPING'), 58, 16, 0.05);
put(container(0x8c3f2c), -62, 12, -0.1);
function caravan(l = 10, c = 0xf3f2ee) { const grp = new THREE.Group(), b = box(l, 2.7, 3.6, c), r = box(l + .4, .25, 4, 0xd9d6cc); r.position.y = 2.7; grp.add(b, r);
  for (const x of [-l / 4, l / 4]) { const w = box(1.1, .9, .06, 0x3d4a57, false); w.position.set(x, 1.3, 1.83); grp.add(w); } return grp; }
put(caravan(11), 34, -14, 0.08);                               // white building with the mural, south of the lane
{ const m = box(5, 2.4, .08, 0x3b5f8c, false); const c = put(new THREE.Group(), 34, -14, 0.08); m.position.set(-2, .2, 1.9); c.add(m); }
put(caravan(8), 46, -22, 0.08); put(caravan(11), 36, -76, 0.12); put(caravan(11), 54, -72, 0.12); put(box(5, 2.2, 2.4, 0x3a3f45), 20, -78, 0.12); put(caravan(9), 62, -42, -0.2);
put(box(4, 2.6, 3, 0xe6c98f), 12, 9, 0);
// long red-roofed shed below the hilltop, south of the lane's west end
{ const grp = new THREE.Group(), b = box(15, 2.5, 4.2, 0xf1eee6), r = box(15.6, .35, 4.8, 0x9c3b2e); r.position.y = 2.5; grp.add(b, r); put(grp, -95, -22, 0.1); }
// cream gazebo tent beside the white building in the yard
{ const grp = new THREE.Group(), b = box(4, 2.1, 4, 0xe9dfb8), r = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.4, 4), lam(0xe9dfb8)); r.rotation.y = Math.PI / 4; r.position.y = 2.8; r.castShadow = true; grp.add(b, r); put(grp, 25, -8, 0.08); }
put(box(.6, .85, .6, 0xf7f7f7), 14.6, 8, 0);                   // washing machine outside it
put(box(4.5, 2.6, 3.2, 0xf3f2ee), -58, 44, 0.3);               // small white shed north-west of the barn
{ const pg = new THREE.Group(), roof = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), lam(0x4a3d33, { side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2; roof.position.y = 2.7; roof.castShadow = true; pg.add(roof);
  for (const [x, z] of [[-4.3, -2.3], [4.3, -2.3], [-4.3, 2.3], [4.3, 2.3]]) { const p = box(.15, 2.7, .15, 0x5a4636); p.position.set(x, 0, z); pg.add(p); } put(pg, 50, -8, 0.08); }
// portable double cubicle
{ const grp = new THREE.Group(), b = box(2.3, 2.3, 1.3, 0xe8eaee), t = box(2.4, .12, 1.4, 0x2d4f9e); t.position.y = 2.3; const s = box(.08, 2.3, 1.32, 0x2d4f9e); grp.add(b, t, s); put(grp, -36, 16, 0.4); }
// cars
function car(c) { const grp = new THREE.Group(), a = box(4.3, .75, 1.8, c), b = box(2.4, .65, 1.6, c); a.position.y = .35; b.position.set(-.2, 1.1, 0); const gl = box(2.42, .45, 1.62, 0x2a3640, false); gl.position.set(-.2, 1.18, 0); grp.add(a, b, gl);
  for (const x of [-1.35, 1.35]) for (const z of [-.9, .9]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .22, 12), lam(0x1c1c1c)); w.rotation.x = Math.PI / 2; w.position.set(x, .36, z); grp.add(w); } return grp; }
[[22, 5, 1.2, 0xf4f4f4], [26, 6, 1.25, 0xf4f4f4], [30, 7, 1.2, 0xcfd3d6], [33, -4, -1.3, 0xf4f4f4], [38, -3, -1.2, 0xf4f4f4], [-2, 10, 0.2, 0xf4f4f4], [44, 8, 1.3, 0xb9bcc0]].forEach(([x, n, r, c]) => put(car(c), x, n, r));
// tractor by the barn
{ const grp = new THREE.Group(), b = box(2.6, 1, 1.1, 0x2d4f9e); b.position.y = .8; const cab = box(1.1, 1.3, 1.1, 0x23324a); cab.position.set(-.8, 1.7, 0); grp.add(b, cab);
  for (const [x, r] of [[-.8, .75], [1, .45]]) for (const z of [-.75, .75]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .35, 14), lam(0x1c1c1c)); w.rotation.x = Math.PI / 2; w.position.set(x, r, z); grp.add(w); } put(grp, 14, 26, 0.6); }
// playground and solar array
function tower() { const grp = new THREE.Group(); for (const x of [-.8, .8]) for (const z of [-.8, .8]) { const p = box(.12, 3.3, .12, 0x2748a8); p.position.set(x, 0, z); grp.add(p); }
  const pl = box(1.8, .1, 1.8, 0x9aa0a6); pl.position.y = 1.3; const rf = new THREE.Mesh(new THREE.ConeGeometry(1.5, .7, 4), lam(0xb53a3a)); rf.rotation.y = Math.PI / 4; rf.position.y = 3.65; rf.castShadow = true; grp.add(pl, rf); return grp; }
put(tower(), 66, -24); put(tower(), 71, -25);
{ const tube = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, 2.4, 14, 1, true), lam(0x2748a8, { side: THREE.DoubleSide })); tube.rotation.z = Math.PI / 2; put(tube, 68.5, -25.5, 0.3, .45);
  const sl = box(.7, .08, 2.4, 0x2748a8); sl.rotation.x = .5; put(sl, 73, -25.5, 0, .2); }
{ const pv = new THREE.Mesh(new THREE.BoxGeometry(9, .1, 3.2), lam(0x1d2c44)); pv.rotation.x = -.45; pv.castShadow = true; put(pv, 74, -34, 0, 1.3); }
// bench at the western lookout
{ const grp = new THREE.Group(), w = 0x8a5a2e, seat = box(2.2, .1, .6, w); seat.position.y = .45; const back = box(2.2, .6, .08, w); back.position.set(0, .55, .28); grp.add(seat, back);
  for (const x of [-1, 1]) { const l = box(.1, .45, .6, w); l.position.x = x; grp.add(l); } put(grp, -246, 25, Math.PI / 2 + .1); }
