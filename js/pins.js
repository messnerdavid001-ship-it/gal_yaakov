// Pins (labels): showing them, adding, renaming and removing. Changes are saved in the browser.
import * as THREE from 'three';
import { DEM, G, CELL, Z0, HALF, road1, r465, r450, paved, ROADS, HOUSES, labelDefs } from './data.js';
import { stage, canvas, renderer, scene, HAZE, camera, rnd, g, sstep, hash, vnoise, fbm, dem, dv, cr, H, P, lam, put, box, contourU, veg, nearRoad, distPoly, olive } from './core.js';
import { terrain } from './terrain.js';

const labelBox = document.getElementById('labels');
const labels = [];   // filled below: every pin, mine and the viewer's, is the same editable kind
let showLabels = true; const tmp = new THREE.Vector3();
function placeLabels(w, h) { for (const l of labels) { tmp.copy(l.p).project(camera); const ok = showLabels && tmp.z < 1 && tmp.z > -1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05 && camera.position.distanceTo(l.p) > 25;
  l.el.hidden = !ok; if (ok) l.el.style.transform = `translate(-50%,-100%) translate(${((tmp.x + 1) / 2 * w).toFixed(1)}px,${((1 - tmp.y) / 2 * h - 14).toFixed(1)}px)`; } }

const lblbtn = document.getElementById('lblbtn'); lblbtn.addEventListener('click', () => { showLabels = !showLabels; lblbtn.setAttribute('aria-pressed', showLabels); });

/* ---------- labels the viewer adds ---------- */
const addbtn = document.getElementById('addbtn'), hint = document.getElementById('hint'), nameform = document.getElementById('nameform'), nameinput = document.getElementById('labelname');
let adding = false, pending = null, downAt = null; const ray = new THREE.Raycaster();
const saveCustom = () => { try { localStorage.setItem('gal-yaakov-pins', JSON.stringify(labels.map(l => [l.t, l.base.x, l.base.y, l.base.z, l.lift]))); } catch (e) {} };
function addCustom(t, base, lift = 8) { const el = document.createElement('div'); el.className = 'lbl custom'; const sp = document.createElement('span'); sp.textContent = t;
  const x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.hidden = true; x.setAttribute('aria-label', 'Remove label');
  el.append(sp, x); labelBox.appendChild(el); const l = { el, sp, x, p: base.clone().add(new THREE.Vector3(0, lift, 0)), base: base.clone(), lift, custom: true, t }; labels.push(l);
  el.addEventListener('click', e => { if (!editing || e.target === x) return; select(l); });
  x.addEventListener('click', () => { labels.splice(labels.indexOf(l), 1); el.remove(); saveCustom(); select(null); }); }
const editbtn = document.getElementById('editbtn'); let editing = false, selected = null;
function select(l) { if (selected) { selected.el.classList.remove('sel'); selected.x.hidden = true; } selected = l;
  if (l) { l.el.classList.add('sel'); l.x.hidden = false; pending = null; nameform.hidden = false; hint.hidden = true; nameinput.value = l.t; nameinput.focus(); }
  else { nameform.hidden = true; hint.hidden = !adding; } }
function setEditing(on) { editing = on; labelBox.classList.toggle('editing', on); editbtn.textContent = on ? 'Done editing' : 'Edit labels'; editbtn.setAttribute('aria-pressed', on);
  hint.textContent = on ? 'Tap any label to rename or remove it' : 'Tap the ground to place a label'; canvas.style.cursor = adding && !on ? 'crosshair' : ''; pending = null; select(null); }
function setAdding(on) { adding = on; addbtn.textContent = on ? 'Stop adding' : 'Add label'; addbtn.setAttribute('aria-pressed', on); editbtn.hidden = !on; setEditing(false); }
addbtn.addEventListener('click', () => setAdding(!adding));
editbtn.addEventListener('click', () => setEditing(!editing));
addEventListener('keydown', e => { if (e.key === 'Escape' && adding) setAdding(false); });
canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => { if (!adding || editing || !downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = ray.intersectObject(terrain)[0]; if (!hit) return; pending = hit.point.clone(); hint.hidden = true; nameform.hidden = false; nameinput.value = ''; nameinput.focus(); });
nameform.addEventListener('submit', e => { e.preventDefault(); const t = nameinput.value.trim();
  if (t && selected) { selected.t = t; selected.sp.textContent = t; saveCustom(); select(null); return; }
  if (t && pending) { addCustom(t, pending); saveCustom(); if (!showLabels) lblbtn.click(); } nameform.hidden = true; pending = null; hint.hidden = !adding; });
document.getElementById('namecancel').addEventListener('click', () => { if (selected) return select(null); nameform.hidden = true; pending = null; hint.hidden = !adding; });
{ // saved pins if this browser has any; otherwise the built-in set plus any pins added before this version
  let saved = null, old = [];
  try { saved = JSON.parse(localStorage.getItem('gal-yaakov-pins')); old = JSON.parse(localStorage.getItem('gal-yaakov-labels') || '[]'); } catch (e) {}
  if (Array.isArray(saved)) for (const [t, x, y, z, lift] of saved) addCustom(String(t), new THREE.Vector3(x, y, z), lift || 8);
  else { for (const [t, x, n, dy] of labelDefs) addCustom(t, P(x, n, 0), dy); if (Array.isArray(old)) for (const [t, x, y, z] of old) addCustom(String(t), new THREE.Vector3(x, y, z)); } }


export { placeLabels };
