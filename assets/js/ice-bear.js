const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu() {
  if (!menu || !nav) return;
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', '메뉴 열기');
}
if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}
const dialog = document.querySelector('#proof-dialog');
const proofImage = document.querySelector('#proof-image');
document.querySelectorAll('a[data-proof]').forEach(a => a.addEventListener('click', e => {
  if (!dialog || !proofImage || typeof dialog.showModal !== 'function') return;
  e.preventDefault();
  proofImage.src = a.href;
  proofImage.alt = a.querySelector('img')?.alt || a.textContent.trim();
  dialog.showModal();
}));
if (dialog) dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
