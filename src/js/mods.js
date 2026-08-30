const KEY = "amble_mods_v3";
const TTL = 12 * 60 * 60 * 1000;

const rows = [...document.querySelectorAll("[data-slug]")];

if (rows.length) {
  const nf = new Intl.NumberFormat("en-US");
  const short = (n) =>
    n >= 1e6
      ? (n / 1e6).toFixed(1) + "M"
      : n >= 1e3
        ? (n / 1e3).toFixed(1) + "k"
        : String(n);

  const cached = read();
  if (cached) paint(cached.counts);

  if (!cached || Date.now() - cached.ts > TTL) {
    fetchCounts()
      .then((counts) => {
        paint(counts);
        write({ counts, ts: Date.now() });
      })
      .catch((err) => console.warn("modrinth:", err));
  }

  function paint(counts) {
    let total = 0;
    for (const row of rows) {
      const n = counts[row.dataset.slug];
      if (typeof n !== "number") continue;
      total += n;
      row.querySelector(".meta-count").textContent = nf.format(n);
      row.querySelector(".row-meta")?.classList.remove("loading");
    }
    const el = document.getElementById("totalDownloads");
    if (el && total > 0) el.textContent = short(total);
  }
}

async function fetchCounts() {
  const ids = rows.map((r) => r.dataset.slug);
  const res = await fetch(
    "https://api.modrinth.com/v2/projects?ids=" +
      encodeURIComponent(JSON.stringify(ids)),
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(res.status + " " + res.statusText);

  const counts = {};
  for (const p of await res.json())
    for (const k of [p.slug, p.id]) if (k) counts[k] = p.downloads || 0;
  return counts;
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function write(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}
