// Fetch Modrinth project & version info and populate .meta spans inside mod cards
// Adds a localStorage cache (12h) to avoid refetching on every page load

document.addEventListener('DOMContentLoaded', () => {
  const modCards = Array.from(document.querySelectorAll('.mod-card'));
  if (!modCards.length) return;

  const CACHE_KEY = 'amble_mods_cache_v1';
  const TTL = 1000 * 60 * 60 * 12; // 12 hours

  const fetchJSON = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  };

  const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString() : '\u2014');

  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saveCache = (cache) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // ignore quota errors
    }
  };

  const cache = loadCache();

  const fetchForSlug = async (slug) => {
    const project = await fetchJSON(`https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`);
    const downloads = project && project.downloads;
    const icon = project && (project.icon_url || project.icon || project.logo || project.logo_url || null);

    let versionLabel = '\u2014';
    try {
      const versions = await fetchJSON(`https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}/version`);
      if (Array.isArray(versions) && versions.length) {
        versions.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));
        const newest = versions[0];
        versionLabel = newest.version_number || newest.name || newest.id || '\u2014';
      }
    } catch (err) {
      if (project && project.versions && project.versions.length) versionLabel = project.versions[0];
    }

    return { version: versionLabel, downloads: downloads, icon };
  };

  (async function populateAll() {
    for (const card of modCards) {
      let slug = card.dataset.slug && String(card.dataset.slug).trim();
      if (!slug) {
        const a = card.querySelector('.card-link');
        if (a) {
          try {
            const url = new URL(a.href);
            const parts = url.pathname.split('/').filter(Boolean);
            slug = parts[parts.length - 1];
          } catch (e) {
            // ignore
          }
        }
      }

      const meta = card.querySelector('.meta');
      const avatarImg = card.querySelector('.mod-icon');
      if (!meta) continue;
      meta.classList.add('loading');
      meta.textContent = 'Loading\u2026';

      if (!slug) {
        meta.classList.remove('loading');
        meta.textContent = 'Version: \u2014 \u2022 Downloads: \u2014';
        continue;
      }

      const cached = cache[slug];
      const now = Date.now();
      if (cached && (now - cached.ts) < TTL) {
        meta.classList.remove('loading');
        meta.textContent = `Version: ${cached.version} \u2022 Downloads: ${formatNumber(cached.downloads)}`;
        if (avatarImg && cached.icon) {
          try { avatarImg.src = cached.icon; } catch (e) { /* ignore */ }
        }
        await new Promise((r) => setTimeout(r, 60));
        continue;
      }

      try {
        const data = await fetchForSlug(slug);
        cache[slug] = { version: data.version, downloads: data.downloads, icon: data.icon || null, ts: Date.now() };
        saveCache(cache);
        meta.classList.remove('loading');
        meta.textContent = `Version: ${data.version} \u2022 Downloads: ${formatNumber(data.downloads)}`;

        if (avatarImg && data.icon) {
          const spinner = document.createElement('div');
          spinner.className = 'mod-avatar-spinner';
          card.appendChild(spinner);

          const onLoaded = () => {
            try { avatarImg.removeEventListener('load', onLoaded); } catch (e) {}
            try { avatarImg.removeEventListener('error', onError); } catch (e) {}
            try { spinner.remove(); } catch (e) {}
          };

          const onError = () => {
            try { avatarImg.removeEventListener('load', onLoaded); } catch (e) {}
            try { avatarImg.removeEventListener('error', onError); } catch (e) {}
            try { spinner.remove(); } catch (e) {}
          };

          avatarImg.addEventListener('load', onLoaded);
          avatarImg.addEventListener('error', onError);

          try { avatarImg.src = data.icon; } catch (e) { spinner.remove(); }
        }
      } catch (err) {
        if (cached) {
          meta.classList.remove('loading');
          meta.classList.add('stale');
          meta.textContent = `Version: ${cached.version} \u2022 Downloads: ${formatNumber(cached.downloads)} (stale)`;
          if (avatarImg && cached.icon) {
            try { avatarImg.src = cached.icon; } catch (e) { /* ignore */ }
          }
        } else {
          meta.classList.remove('loading');
          meta.textContent = 'Version: \u2014 \u2022 Downloads: \u2014';
        }
        console.warn('Failed to fetch Modrinth data for', slug, err);
      }

      await new Promise((r) => setTimeout(r, 120));
    }
  })();
});
