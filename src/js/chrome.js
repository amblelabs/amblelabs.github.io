const nav = document.getElementById("mainNav");
if (nav) {
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
}

const burger = document.getElementById("navBurger");
const menu = document.getElementById("mobileNav");
if (burger && menu) {
  const set = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", () => set(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => e.target.closest("a") && set(false));
}

const links = document.querySelectorAll(".nav-links .nav-link");
const secs = [...links]
  .map((a) => document.getElementById(a.dataset.section))
  .filter(Boolean);

if (secs.length && "IntersectionObserver" in window) {
  const seen = new Set();
  const spy = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (e.isIntersecting) seen.add(e.target.id);
        else seen.delete(e.target.id);
      }
      const cur = secs.find((s) => seen.has(s.id));
      for (const a of links)
        a.classList.toggle("active", !!cur && a.dataset.section === cur.id);
    },
    { rootMargin: "-25% 0px -60% 0px" },
  );
  for (const s of secs) spy.observe(s);
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const targets = document.querySelectorAll(".reveal, .reveal-group");

if (reduced || !("IntersectionObserver" in window)) {
  for (const el of targets) el.classList.add("in");
} else {
  for (const g of document.querySelectorAll(".reveal-group")) {
    let i = 0;
    for (const c of g.children)
      c.style.setProperty("--d", Math.min(i++ * 60, 420) + "ms");
  }

  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
  );
  for (const el of targets) io.observe(el);
}

const mark = document.querySelector(".hero-mark");
if (mark) {
  let n = 0;
  let fired = 0;

  mark.addEventListener("click", () => {
    if (fired || ++n < 10) return;
    fired = 1;

    const box = document.createElement("div");
    box.className = "egg";
    const line = document.createElement("p");
    line.className = "egg-line";
    const sig = document.createElement("p");
    sig.className = "egg-sig";
    sig.innerHTML =
      "page made with love by <b>HAILRAKE</b>. Always be kind. " +
      "Hate is always foolish and love is always wise.";
    box.append(line, sig);
    document.body.appendChild(box);

    const msg = "i will always love you";
    let i = 0;
    const t = setInterval(() => {
      line.textContent = msg.slice(0, ++i);
      if (i < msg.length) return;
      clearInterval(t);
      sig.classList.add("in");
      setTimeout(() => {
        box.classList.add("out");
        setTimeout(() => box.remove(), 900);
      }, 3200);
    }, 85);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hero-mark")) n = 0;
  });
}
