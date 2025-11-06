// Settings menu: tilt, saturn mode, party mode
(function () {
  const TILT_KEY = 'amblelabs.tiltEnabled';
  const SATURN_KEY = 'amblelabs.saturnMode';
  const PARTY_KEY = 'amblelabs.partyMode';

  function $(sel, root = document) { return root.querySelector(sel); }

  function setTiltEnabled(enabled) {
    // tilt.js expects localStorage value 'true' when enabled
    window.localStorage.setItem(TILT_KEY, String(enabled));
    if (!enabled) document.documentElement.classList.add('tilt-disabled');
    else document.documentElement.classList.remove('tilt-disabled');
    // update the visible toggle button if present
    const native = $('#tiltToggle');
    if (native) {
      native.setAttribute('aria-pressed', String(enabled));
      native.textContent = enabled ? 'Tilt: On' : 'Tilt: Off';
    }
  }

  function setSaturnMode(enabled) {
    window.localStorage.setItem(SATURN_KEY, String(enabled));
    if (enabled) {
      document.body.classList.add('saturn-mode');
      // inject font link if missing; CSS `.saturn-mode` will apply the
      // font globally once the stylesheet loads.
      if (!document.getElementById('comicReliefFont')) {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap";
        link.rel = 'stylesheet';
        link.id = 'comicReliefFont';
        document.head.appendChild(link);
      }
    } else {
      document.body.classList.remove('saturn-mode');
      // remove the injected font link (clean up) — it's safe to remove
      // because `.saturn-mode` will no longer be applied.
      const link = document.getElementById('comicReliefFont');
      if (link) link.remove();
    }
  }

  function setPartyMode(enabled) {
    window.localStorage.setItem(PARTY_KEY, String(enabled));
    // toggle the class on the root <html> element so the filter/animation
    // applies to the entire rendered viewport (covers fixed, absolute, and
    // background elements as well). This ensures the whole viewable page
    // hue-rotates, not just the <body> children.
    if (enabled) document.documentElement.classList.add('party-mode');
    else document.documentElement.classList.remove('party-mode');
    console.debug('settings:setPartyMode', enabled);
  }

  function openMenu() {
    const menu = $('#settingsMenu');
    const btn = $('#hamburgerBtn');
    if (!menu || !btn) return;
    // reveal menu then animate the panel
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const panel = menu.querySelector('.settings-panel');
    // ensure no stale listeners
    panel.classList.remove('open');
    // force style recalc then add open to start transition
    // (some browsers need a microtask)
    requestAnimationFrame(() => panel.classList.add('open'));
    // focus first input after open animation
    const first = menu.querySelector('input');
    if (first) setTimeout(() => first.focus(), 260);
    // allow escape to close
    function onKey(e) {
      if (e.key === 'Escape') closeMenu();
    }
    menu._onKey = onKey;
    document.addEventListener('keydown', onKey);
  }

  function closeMenu() {
    const menu = $('#settingsMenu');
    const btn = $('#hamburgerBtn');
    if (!menu || !btn) return;
    const panel = menu.querySelector('.settings-panel');
    // remove open to trigger slide-down
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    // after transition ends, hide the overlay. Also add a safety timeout
    // in case transitionend doesn't fire (browser quirk or interrupted animation).
    let ended = false;
    const onEnd = (ev) => {
      if (ev.target !== panel) return;
      ended = true;
      menu.hidden = true;
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
    // safety fallback: force hide after 400ms if transitionend never fired
    setTimeout(() => {
      if (!ended) {
        menu.hidden = true;
        try { panel.removeEventListener('transitionend', onEnd); } catch (e) {}
      }
    }, 400);
    if (menu._onKey) {
      document.removeEventListener('keydown', menu._onKey);
      delete menu._onKey;
    }
  }

  function init() {
    const hamburger = $('#hamburgerBtn');
    const close = $('#settingsClose');
    const menu = $('#settingsMenu');
    const tiltCheckbox = $('#menuTiltToggle');
    const saturnCheckbox = $('#saturnToggle');
    const partyCheckbox = $('#partyToggle');
    const nativeTilt = $('#tiltToggle');

    if (!menu || !hamburger) return;

    // hydrate from storage
    const savedTilt = window.localStorage.getItem(TILT_KEY);
    const tiltEnabled = savedTilt === null ? true : savedTilt === 'true';
    if (tiltCheckbox) tiltCheckbox.checked = tiltEnabled;
    setTiltEnabled(tiltEnabled);

    const savedSaturn = window.localStorage.getItem(SATURN_KEY) === 'true';
    if (saturnCheckbox) saturnCheckbox.checked = savedSaturn;
    setSaturnMode(savedSaturn);

    const savedParty = window.localStorage.getItem(PARTY_KEY) === 'true';
    if (partyCheckbox) partyCheckbox.checked = savedParty;
    setPartyMode(savedParty);

    // open/close handlers
    hamburger.addEventListener('click', () => {
      if (menu.hidden) openMenu(); else closeMenu();
    });
    if (close) close.addEventListener('click', closeMenu);

    // sync native tilt button -> menu checkbox
    if (nativeTilt) {
      nativeTilt.addEventListener('click', () => {
        // it's toggled after tilt.js handler runs; read storage and sync
        const cur = window.localStorage.getItem(TILT_KEY);
        const enabled = cur === null ? true : cur === 'true';
        if (tiltCheckbox) tiltCheckbox.checked = enabled;
      });
    }

    // menu toggle handlers
    if (tiltCheckbox) {
      tiltCheckbox.addEventListener('change', (e) => {
        setTiltEnabled(e.target.checked);
      });
    }

    if (saturnCheckbox) {
      saturnCheckbox.addEventListener('change', (e) => {
        setSaturnMode(e.target.checked);
      });
    }

    if (partyCheckbox) {
      partyCheckbox.addEventListener('change', (e) => {
        const turningOn = e.target.checked;
        console.debug('settings:party:change', turningOn);
        if (turningOn) {
          // warn user due to seizure risk
          const ok = confirm('Party Mode enables flashing colors. If you have photosensitive epilepsy, do not enable it. Continue?');
          if (!ok) { e.target.checked = false; return; }
        }
        setPartyMode(e.target.checked);
      });
    }

    // close when clicking outside panel
    menu.addEventListener('click', (ev) => {
      if (ev.target === menu) closeMenu();
    });
    console.debug('settings:listeners-attached');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
