import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const icon = (...p) => join(root, "src/assets/icon", ...p);

const data = JSON.parse(readFileSync(join(root, "src/data/site.json"), "utf8"));
const logos = new Set(
  readdirSync(icon("logo"))
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.slice(0, -4)),
);

const bad = [];
const need = (file, what) =>
  existsSync(file) || bad.push(`${what} -> missing file ${file}`);

for (const [group, list] of Object.entries(data.members)) {
  for (const m of list) {
    need(icon("team", m.avatar), `members.${group} "${m.name}"`);
    for (const k of Object.keys(m.socials ?? {}))
      if (!logos.has(k))
        bad.push(
          `members.${group} "${m.name}" -> unknown social "${k}". ` +
            `add src/assets/icon/logo/${k}.svg, or use one of: ${[...logos].join(", ")}`,
        );
  }
}

for (const mod of data.mods)
  need(icon("mod", `${mod.slug}.${mod.icon ?? "webp"}`), `mods "${mod.name}"`);

for (const k of Object.keys(data.links))
  if (!logos.has(k)) bad.push(`links.${k} -> no logo svg`);

for (const d of data.donations)
  if (!logos.has(d.icon))
    bad.push(`donations "${d.name}" -> unknown icon "${d.icon}"`);

for (const k of ["discord", "github", "codeberg", "modrinth"])
  if (!data.links[k]) bad.push(`links.${k} is required, the buttons use it`);

if (bad.length) {
  console.error(`\nsite.json has ${bad.length} problem(s):\n`);
  for (const b of bad) console.error("  - " + b);
  console.error("");
  process.exit(1);
}

const people = Object.values(data.members).flat().length;
console.log(`site.json ok - ${people} people, ${data.mods.length} mods`);
