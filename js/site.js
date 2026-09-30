const header = document.getElementById('site-header');
const drawer = document.getElementById('drawer');
const backdrop = document.getElementById('drawer-backdrop');
const openButton = document.getElementById('open-drawer');

if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setDrawer(open) {
  if (!drawer) return;
  drawer.classList.toggle('is-open', open);
  drawer.hidden = !open;
  drawer.style.display = open ? 'flex' : 'none';
  drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (backdrop) {
    backdrop.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    backdrop.style.display = open ? 'block' : 'none';
  }
  if (openButton) openButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflow = open ? 'hidden' : '';
}

openButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setDrawer(true);
});
document.getElementById('close-drawer')?.addEventListener('click', (event) => {
  event.stopPropagation();
  setDrawer(false);
});
backdrop?.addEventListener('click', () => setDrawer(false));
drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setDrawer(false);
});
setDrawer(false);

document.querySelectorAll('.choice input').forEach((input) => {
  const sync = () => input.closest('.choice')?.classList.toggle('on', input.checked);
  input.addEventListener('change', () => {
    if (input.type === 'radio') {
      document.querySelectorAll(`input[name="${input.name}"]`).forEach((peer) => peer.closest('.choice')?.classList.remove('on'));
    }
    sync();
  });
  sync();
});
