/* Пасхалка: клик по «ai creator» отправляет вверх сердечко.
   На 11-м клике надпись краснеет и держится красной 5 кликов. */
(() => {
  'use strict';

  const btn = document.querySelector('button.mark--egg');
  if (!btn) return;

  const RED_AT  = 11;   // клик, на котором надпись краснеет
  const RED_FOR = 5;    // сколько кликов держится красной

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let clicks = 0;

  btn.addEventListener('click', () => {
    clicks++;

    if (clicks === RED_AT){
      btn.classList.add('is-red');
    } else if (clicks === RED_AT + RED_FOR){
      btn.classList.remove('is-red');
      clicks = 0;                       // цикл повторяется с нуля
    }

    fly();
  });

  function fly(){
    const img = document.createElement('img');
    img.src = 'assets/heart.webp';
    img.alt = '';
    img.className = 'heart';
    img.setAttribute('aria-hidden', 'true');
    btn.appendChild(img);

    const rnd   = (a, b) => a + Math.random() * (b - a);
    const drift = rnd(-22, 22);         // разлёт в стороны
    const spin  = rnd(-24, 24);
    const rise  = rnd(72, 104);

    const dur = reduced ? 1 : rnd(950, 1250);

    const anim = img.animate([
      { transform: 'translate(-50%, 0) scale(.4) rotate(0deg)', opacity: 0 },
      { transform: `translate(-50%, ${-rise * 0.22}px) scale(1) rotate(${spin * 0.35}deg)`,
        opacity: 1, offset: 0.22 },
      { transform: `translate(calc(-50% + ${drift}px), ${-rise}px) scale(.8) rotate(${spin}deg)`,
        opacity: 0 }
    ], {
      duration: reduced ? 1 : rnd(950, 1250),
      easing: 'cubic-bezier(.22, .61, .24, 1)'
    });

    const clean = () => img.remove();
    anim.onfinish = clean;
    anim.oncancel = clean;
  }
})();
