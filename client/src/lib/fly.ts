export function flyToCart(source: HTMLElement) {
  const cart = document.querySelector('[data-cart-target]');
  if (!cart) return;
  const from = source.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.classList.add('fly-ghost');
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.width = `${from.width}px`;
  ghost.style.height = `${from.height}px`;
  document.body.appendChild(ghost);
  source.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
    { duration: 320, easing: 'ease-out' },
  );
  const to = cart.getBoundingClientRect();
  const animation = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${to.left - from.left + to.width / 2 - from.width / 2}px, ${to.top - from.top}px) scale(0.18)`, opacity: 0.4 },
    ],
    { duration: 680, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' },
  );
  animation.onfinish = () => ghost.remove();
  cart.classList.remove('shake');
  void (cart as HTMLElement).offsetWidth;
  cart.classList.add('shake');
}
