/* Всплывающие окна у надписей: «контакты» и «о варвацы».
   Оба окна ведут себя одинаково, поэтому обработчик один на все кнопки
   с aria-controls. */
(() => {
  'use strict';

  document.querySelectorAll('.mark__btn[aria-controls]').forEach(setup);

  function setup(btn){
    const pop = document.getElementById(btn.getAttribute('aria-controls'));
    if (!pop) return;

    let open = false;

    function show(){
      if (open) return;
      open = true;
      pop.hidden = false;
      // принудительный пересчёт: без него браузер применит конечное состояние
      // сразу и перехода не будет. requestAnimationFrame здесь ненадёжен.
      void pop.offsetWidth;
      pop.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }

    function hide(back){
      if (!open) return;
      open = false;
      pop.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');

      const done = () => {
        if (!open) pop.hidden = true;
        pop.removeEventListener('transitionend', done);
      };
      pop.addEventListener('transitionend', done);
      setTimeout(done, 400);                   // страховка, если перехода не было

      if (back) btn.focus({ preventScroll: true });
    }

    btn.addEventListener('click', () => {
      open ? hide(false) : show();
    });

    // Клик мимо окна закрывает. Событие не останавливается на кнопке: иначе
    // открытие одного окна не закрывало бы соседнее.
    document.addEventListener('click', e => {
      if (open && !pop.contains(e.target) && !btn.contains(e.target)) hide(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) hide(true);
    });

    // уход фокуса за пределы окна тоже закрывает
    pop.addEventListener('focusout', () => {
      setTimeout(() => {
        if (open && !pop.contains(document.activeElement) && !btn.contains(document.activeElement)) hide(false);
      }, 0);
    });
  }
})();
