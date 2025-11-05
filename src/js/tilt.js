// Lightweight tilt effect for .card elements
// - rotates card based on mouse position
// - resets on mouseleave
// Works with the existing .column { perspective: ... } in CSS

(function () {
  // Tilt + moving sheen for .card elements
  // Increased for a more dramatic tilt per user request
  const MAX_ROT = 28; // degrees
  const SCALE = 1.18;
  const TRANSITION_IN = 'transform 220ms cubic-bezier(.03,.98,.52,.99)';

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // persistent toggle state key
  const STORAGE_KEY = 'amblelabs.tiltEnabled';

  function setVars(card, vars) {
    for (const k in vars) card.style.setProperty(k, vars[k]);
  }

  function onMove(e) {
    const card = e.currentTarget;
    // If user prefers reduced motion, provide a minimal, subtle tilt only
    // (no sheen, no dynamic shadow) so the UI isn't completely static but
    // avoids heavy motion/animations.
  if (prefersReduced) {
      const rect = card.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const px = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
      const py = Math.max(-1, Math.min(1, dy / (rect.height / 2)));
  // still reduce the motion but make it noticeably stronger than before
  const rotateY = px * (MAX_ROT * 0.6);
  const rotateX = -py * (MAX_ROT * 0.6);
      card.style.transition = 'transform 120ms linear';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
      return;
    }
    const rect = card.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const px = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
    const py = Math.max(-1, Math.min(1, dy / (rect.height / 2)));

  const rotateY = px * MAX_ROT;
  const rotateX = -py * MAX_ROT;
  // faster transform for responsiveness
  card.style.transition = 'transform 48ms linear';
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${SCALE})`;

    // Sheen positioning (percent values)
    const sx = 50 + px * -18; // invert so light appears from top-left when cursor is top-left
    const sy = 50 + py * -18;
    const maxAbs = Math.max(Math.abs(px), Math.abs(py));
    const shineOpacity = Math.min(0.9, 0.15 + maxAbs * 0.85);
    const streakOpacity = Math.min(0.6, maxAbs * 0.6);

    setVars(card, {
      '--shine-x': `${sx}%`,
      '--shine-y': `${sy}%`,
      '--shine-opacity': `${shineOpacity}`,
      '--streak-x': `${sx}%`,
      '--streak-y': `${sy}%`,
      '--streak-opacity': `${streakOpacity}`,
      '--streak-rot': `${-rotateY * 1.8}deg`
    });

    // dynamic shadow (move opposite to light)
    // stronger shadow math for a more visible effect
  // stronger shadow math for a more visible, dramatic effect
  const shadowOffsetX = Math.round(-px * 28);
  const shadowOffsetY = Math.round(py * 28);
  const shadowBlur = 24 + Math.round(maxAbs * 48);
  const shadowOpacity = Math.min(0.95, 0.28 + maxAbs * 0.6);
    const shadowValue = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`;
    // set as CSS variable so it transitions with the card
    card.style.setProperty('--card-shadow', shadowValue);

    // Avatar shadow: smaller and closer to the avatar element
    // bigger avatar shadow to match the more dramatic card shadow
    const avatarOffsetX = Math.round(-px * 12);
    const avatarOffsetY = Math.round(py * 14);
    const avatarBlur = 12 + Math.round(maxAbs * 24);
    const avatarOpacity = Math.min(0.9, 0.18 + maxAbs * 0.6);
    const avatarShadow = `${avatarOffsetX}px ${avatarOffsetY}px ${avatarBlur}px rgba(0,0,0,${avatarOpacity})`;
    card.style.setProperty('--avatar-shadow', avatarShadow);
  }

  function onEnter(e) {
    const card = e.currentTarget;
    // if disabled via toggle, ignore
    if (document.documentElement.classList.contains('tilt-disabled')) return;
    card.style.transition = TRANSITION_IN;
    // mark card as actively tilting so CSS can target avatar shadow / styles
    card.classList.add('tilt-active');
  }

  function onLeave(e) {
    const card = e.currentTarget;
    card.style.transition = TRANSITION_IN;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    // reset sheen
    setVars(card, {
      '--shine-opacity': '0',
      '--streak-opacity': '0'
    });
    // clear dynamic shadow to let CSS rule take effect (reset CSS var)
    card.style.setProperty('--card-shadow', '0 6px 18px rgba(0,0,0,0.22)');
    // remove tilt-active class and reset avatar shadow
    card.classList.remove('tilt-active');
    card.style.setProperty('--avatar-shadow', '0 6px 10px rgba(0,0,0,0.12)');
  }

  function init() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      // Always attach listeners so interaction is available.
      // onMove will respect prefers-reduced-motion and fall back to a minimal tilt.
      card.addEventListener('mousemove', onMove);
      card.addEventListener('touchmove', onMove, { passive: true });
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('touchend', onLeave);
    });

    // Setup toggle control if present in the page
    const toggle = document.getElementById('tiltToggle');
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const enabled = saved === null ? true : saved === 'true';
    if (!enabled) document.documentElement.classList.add('tilt-disabled');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = enabled ? 'Tilt: On' : 'Tilt: Off';
      toggle.addEventListener('click', () => {
        const cur = document.documentElement.classList.toggle('tilt-disabled');
        const isDisabled = document.documentElement.classList.contains('tilt-disabled');
        window.localStorage.setItem(STORAGE_KEY, String(!isDisabled));
        toggle.setAttribute('aria-pressed', String(!isDisabled));
        toggle.textContent = !isDisabled ? 'Tilt: On' : 'Tilt: Off';
        // when disabling, reset all cards to neutral state
        if (isDisabled) {
          document.querySelectorAll('.card').forEach(c => {
            c.style.transform = '';
            c.style.setProperty('--card-shadow', '0 6px 18px rgba(0,0,0,0.22)');
            c.style.transition = 'transform 220ms cubic-bezier(.03,.98,.52,.99), box-shadow 220ms cubic-bezier(.03,.98,.52,.99)';
            setVars(c, { '--shine-opacity': '0', '--streak-opacity': '0' });
          });
        }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
