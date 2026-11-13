// Renderer, scene and the small helpers every other file uses.
import * as THREE from 'three';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';

const stage = document.getElementById('stage'), canvas = document.getElementById('c');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); }
catch (e) { document.getElementById('err').hidden = false; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const HAZE = 0xbfd3ea;
scene.fog = new THREE.Fog(HAZE, 1800, 9000);
const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 14000);

/* ---------- helpers: world is x = east, n = north (z = -n), y = up, metres ---------- */
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const g = (dx, dn, sx, sn) => Math.exp(-(dx * dx) / (sx * sx) - (dn * dn) / (sn * sn));
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v; }
const fbm = (x, y) => vnoise(x, y) * .55 + vnoise(x * 2.1, y * 2.1) * .3 + vnoise(x * 4.3, y * 4.3) * .15;

const dem = new Float32Array(G * G); for (let i = 0; i < G * G; i++) dem[i] = parseInt(DEM.substr(i * 2, 2), 36) / 2 + 330 - Z0;
const dv = (c, r) => dem[Math.min(G - 1, Math.max(0, r)) * G + Math.min(G - 1, Math.max(0, c))];
const cr = (a, b, c, d, t) => b + .5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
function H(x, n) {
  const fc = Math.min(G - 1, Math.max(0, (x + HALF) / CELL)), fr = Math.min(G - 1, Math.max(0, (HALF - n) / CELL)), c = Math.floor(fc), r = Math.floor(fr), tx = fc - c, ty = fr - r;
  const row = k => cr(dv(c - 1, r + k), dv(c, r + k), dv(c + 1, r + k), dv(c + 2, r + k), tx);
  return cr(row(-1), row(0), row(1), row(2), ty) + (fbm(x / 14, n / 14) - .5) * 1.0 * sstep(40, 140, Math.hypot(x - 10, n - 5));
}
const P = (x, n, dy = 0) => new THREE.Vector3(x, H(x, n) + dy, -n);
const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
function put(obj, x, n, rot = 0, dy = 0) { obj.position.copy(P(x, n, dy)); obj.rotation.y = rot; scene.add(obj); return obj; }
function box(w, h, d, c, sh = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); m.geometry.translate(0, h / 2, 0); m.castShadow = sh; m.receiveShadow = true; return m; }

const contourU = { value: 1 }, veg = [];
const nearRoad = (x, n, pad = 2) => ROADS.some(r => distPoly(x, n, r[0]) < r[1] / 2 + pad);
function distPoly(x, n, pts) { let best = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [ax, an] = pts[i], [bx, bn] = pts[i + 1], vx = bx - ax, vn = bn - an;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (n - an) * vn) / (vx * vx + vn * vn))); best = Math.min(best, Math.hypot(x - ax - vx * t, n - an - vn * t)); } return best; }
const olive = (x, n) => n > 28 && n < 215 && x > -199 && x < 170 && !(x > -80 && x < 70 && n < 52);

export { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive };
