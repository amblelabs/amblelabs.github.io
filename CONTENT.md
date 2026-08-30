# Editing the site

Everything on the page comes out of `src/data/site.json`. Normal updates never
need to touch a component or the CSS.

The file points at `site.schema.json`, so VS Code gives you autocomplete and
underlines typos while you type. Before pushing:

    bun run check

That confirms every avatar and mod icon exists and every social key has a logo.
CI runs the same thing before the build, so a broken edit fails with a readable
message instead of a stack trace.

## Adding a person

Drop a square image in `src/assets/icon/team/` (webp is smallest), then add a
block to the right group:

    {
      "name": "Rassilon",
      "avatar": "rassilon.webp",
      "role": "Gallifreyan Liaison",
      "quote": "Time is not the boss of me.",
      "link": "https://example.dev",
      "socials": {
        "github": "https://github.com/rassilon",
        "kofig": "https://ko-fi.com/rassilon"
      }
    }

Only `name` and `avatar` are required, the card just gets shorter without the
rest. Groups render in this order, headings live in `src/pages/index.astro`:

    developers          Developers
    artists             Art, music & sound
    others              Community & wiki
    junior_developers   Junior developers

`junior_developers` don't need a role, the card falls back to "Junior
developer". The "30 People" counter adds itself up.

Social keys that exist: github, codeberg, modrinth, discord, discordg, youtube,
youtubeg, tiktok, tiktokg, bluesky, tumblr, x, kofi, kofig, boosty, boostyg,
patreon, site. The `g` variants are the single-colour marks. For a new one, add
`src/assets/icon/logo/<name>.svg` and put the name in the `socialKey` list in
`site.schema.json`.

## Adding a mod

Icon goes in `src/assets/icon/mod/<slug>.webp` (png works too, then add
`"icon": "png"`), then:

    {
      "name": "Loqor's Weeping Angels",
      "slug": "loqors-weeping-angels",
      "description": "Don't blink."
    }

`slug` has to be the Modrinth slug. Download counts come from
api.modrinth.com in one request for all mods, cached in the visitor's browser
for 12h. A mod that isn't on Modrinth yet shows a dash and nothing breaks.

First entry in `mods` renders as the flagship (big icon, big type, tag).
Reorder the array to change that.

## Changing text

    tagline           footer and meta description
    description       the About paragraph
    youtube_embed     video id only, not a URL
    commissions       form link
    wikis             docs rows
    donations         donation cards

Headline, section headings and button labels are in `src/pages/index.astro`.
The ASCII logotype is `src/data/ascii.txt`.

## Running it

    bun install
    bun run dev

`bun run build` validates the data, then builds to `dist/`.

On Windows the build prints an astro-font error at the very end
(`ENOPROTOOPT ... C:\C:\`). That plugin mishandles Windows paths and it fires
after the site is already written, so `dist/` is fine. Linux CI is unaffected.
