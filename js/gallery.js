// Photo page: tap a photo to open it full size; Close, Escape or a tap on the backdrop shuts it.
const viewer = document.getElementById('viewer'), big = document.getElementById('big'), cap = document.getElementById('cap'), closeBtn = document.getElementById('close');
let opener = null;
function shut() { viewer.hidden = true; big.removeAttribute('src'); if (opener) opener.focus(); }
document.querySelectorAll('.grid a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); opener = a;
  const img = a.querySelector('img'); big.src = a.dataset.full; big.alt = img.alt; cap.textContent = img.alt; viewer.hidden = false; closeBtn.focus(); }));
closeBtn.addEventListener('click', shut);
viewer.addEventListener('click', e => { if (e.target === viewer) shut(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !viewer.hidden) shut(); });
