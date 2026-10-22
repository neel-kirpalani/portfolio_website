# Neel Kirpalani: portfolio

A single page. Short bio on the left, then lists of projects, awards, experience,
activities and education on the right. Rows expand in place to show detail.

Planning and rationale live in [`PLAN.md`](./PLAN.md), including the note in
section 14 about the move from the original dark design to this one.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Editing content

**Everything is in [`content/projects.ts`](./content/projects.ts).** No CMS, no
database, no MDX. Adding a project means adding one object to `projects`; the
list on the home page reads from it and the write-up expands inline.

```ts
{
  slug: "my-project",         // just an id; there are no separate pages
  title: "My Project",
  summary: "A few words for the collapsed row",
  premise: "One line, plain language: what it does.",
  role: "What you personally did.",
  year: "2026",
  stack: ["ESP32", "Python"],
  status: "built",            // shipped | built | published | ongoing
  recognition: "Only if real and checkable.",
  problem: "...",             // optional; becomes the inline write-up
  approach: "...",
  outcome: "...",
  href: "https://...",        // optional
  appStore: "https://...",    // optional
  logo: "/logos/foo.png",     // optional; omit rather than guess
}
```

Also exported: `experience`, `awards`, `activities`, `education`, `about`.

## Design system

Defined once in [`app/globals.css`](./app/globals.css) under `@theme`. Nothing
in the app hard-codes a hex value.

| Token | Value | Use |
|---|---|---|
| `paper` | `#FFFFFF` | Page background |
| `wash` | `#F4F4F5` | Row hover |
| `ink` | `#09090B` | Text |
| `muted` | `#71717A` | Secondary text, row qualifiers |
| `faint` | `#A1A1AA` | Chevrons, pin icon |
| `line` | `#E4E4E7` | Hairlines, chip rings |

**There is no accent colour, on purpose.** The only colour on the page comes
from real brand marks: the organisation logos in the rows and the social
glyphs in "Find me". That is what keeps a plain white layout from looking
generic.

Type is two roles, both loaded through `next/font`:

- **Domine** 600 for the name and the section headings. A sturdier serif than the
  usual display choice.
- **Inter** for everything else. Body is 16px, rows 16px, qualifiers 14px, and
  everything is tracked `-0.025em`.

The scale was measured off the reference site with `.design_refs/probe.mjs`
rather than eyeballed, which is why the row height, section gap (32px) and chip
height (34px) all line up with it.

**Rows are one line.** A 24px logo, the title, a muted qualifier, the year, a
chevron. The whole write-up (problem, approach, outcome) expands underneath.
On phones the qualifier is hidden rather than wrapping rows to three lines.

**There are no dividers.** Each row carries a transparent 2px bottom border
that only takes colour on hover, so a long list never reads as a table. A
static hairline between every row was the single biggest thing making the page
feel cramped.

**The name sits above both columns, not inside the left one.** The list column
starts level with the *bio*, not with the name (measured off the reference at
136px lower), and the bio is indented from the name's left edge, with "Find me"
aligned to the bio text rather than to the avatar. The name and the body copy
deliberately do not share a left edge. This was measured with
`.design_refs/probe-indent.mjs`, not eyeballed.

**The page itself does not scroll.** On large screens `main` is `h-dvh` with
`overflow-hidden`: the profile column is fixed and only the list pane scrolls,
in its own region with `overscroll-behavior: contain` and a hidden scrollbar.
Below `lg` the columns stack and normal document scrolling returns.

The profile column has to *fit* the viewport, which is why its bio is 15px with
normal leading rather than 16px relaxed, and why the row qualifiers are kept
short. It fits from about **680px** up; below that it scrolls gracefully rather
than clipping.

The indent is deliberately shallow (40px, not the reference's 144px). Every
pixel of indent narrows the bio, which wraps to more lines and pushes "Find me"
out of view. Going from 128px to 40px cut 45px of height and moved the
threshold from 780px down to 680px. The name still does not share a left edge
with the body copy, which is the point of the indent.

**"Find me" is a row of chips:** a hairline ring around a white capsule, brand
glyph plus handle, 34px tall. The ring is the outer element's background showing
through a 1px padding, which is what gives it that layered edge.

## Logos and marks

`/public/logos` holds organisation marks for REMAKE, Kaggle, NYU, HKU, VEX,
HKIS and TomStar. Each one was checked visually before being used. Two domains
I initially guessed (`tomstar.com`, `thescholarlyreview.com`) turned out to
resolve to unrelated sites, so neither has a logo from that route. **A wrong
mark beside a real award is worse than no mark.** The TomStar mark was supplied
directly by Neel instead. Rows reserve the logo slot either way, so titles stay
aligned.

Note that the TomStar mark is a *wordmark*, not a symbol, so at 24px it reads as
a small orange mark rather than legible type. That is a property of the asset,
not of the sizing; a symbol variant would read better at this size.

The social icons in "Find me" are official brand glyphs from
[Simple Icons](https://simpleicons.org) (CC0), kept in `components/icons.ts`.
They are **generated, not hand-written**: a brand path typed from memory is a
subtly wrong logo:

```bash
node .design_refs/gen-icons.mjs
```

Together with the organisation logos, these marks are the only colour on the
page. That is deliberate: it keeps a plain white layout from looking generic.

## Structure

```
app/
  layout.tsx              fonts, metadata, viewport
  page.tsx                the entire site; it is one page
  icon.svg                favicon
components/
  Profile.tsx             name, location, photo, bio, "Find me"
  Section.tsx             a titled list
  Row.tsx                 one line; expands to the full write-up in place
  icons.ts                brand glyphs (generated, see below)
content/projects.ts       all content
```

There is no `/work/[slug]` route. Everything, including each project's problem,
approach and outcome, lives on the one page and expands in place.

## Craft

The details below are mostly invisible, which is the point. They come from the
Emil Kowalski and Apple design-engineering skills.

**Motion**

- `--ease-out` is overridden to `cubic-bezier(0.23, 1, 0.32, 1)`. The built-in
  CSS easings are too weak to read as deliberate.
- Rows scale to `0.995` and wash their background on `:active`, giving feedback
  on pointer-*down* rather than on release, which is what reads as lag. 160ms.
- The disclosure animates with a `transition` on `grid-template-rows`
  (0fr → 1fr), not keyframes, so toggling quickly mid-flight retargets instead
  of restarting. 250ms.
- The page fades up 6px on first paint via `@starting-style`, staggered 50ms
  across sections. Pure CSS, no JavaScript, and if `@starting-style` is
  unsupported the content simply appears.
- Tracking is size-specific: `-0.03em` on the h1, `-0.015em` on section
  headings, near-zero on body copy. Newsreader is loaded with its `opsz` axis
  so optical sizing actually does something.

**Mobile**, the tells that make a site feel like a website on a phone:

- `-webkit-tap-highlight-color: transparent`, which kills the grey flash on tap.
- Every `:hover` is gated behind `@media (hover: hover) and (pointer: fine)`.
  Tailwind v4 does this for `hover:` utilities; `.link-underline:hover` is
  gated by hand.
- `touch-action: manipulation` on controls, to kill the 300ms double-tap wait.
- `user-select: none` on buttons only, never on body text, so the email
  address stays copyable.
- `viewport-fit=cover` plus `theme-color: #ffffff` in the `viewport` export.

**Reduced motion** means fewer and gentler, not zero: the fades stay because
they aid comprehension, the movement goes because it causes sickness. The
entrance drops its `translateY`, the disclosure and chevron become instant, and
the press feedback keeps its colour change but loses its scale.

## Accessibility and robustness

- Rows with detail are real `<button>`s with `aria-expanded` and
  `aria-controls`, so Tab and Enter/Space work with no custom key handling.
  Rows with nothing to show are not buttons at all.
- One visible focus treatment, in ink.
- No horizontal overflow at 320px or 390px (verified).
- Logos are `aria-hidden`; they are decorative, and the organisation is always
  named in the adjacent text.

## Verification

The scratch folder `.design_refs/` holds the harness used while building:

```bash
cd .design_refs
node shoot.mjs home http://localhost:3000/ 4000 1440 900 full-reduce
node shoot.mjs open http://localhost:3000/ 4000 1440 950 viewport-reduce \
  "#projects" "" "#projects button[aria-expanded]"

# Row interaction, keyboard toggling and press feedback.
node test-rows.mjs http://localhost:3000/

# Same suite under a touch posture (hover:none, pointer:coarse).
node test-rows.mjs http://localhost:3000/ touch
```

`shoot.mjs` drives headless Chrome over CDP directly, so no Playwright is needed. It
emulates real device metrics (Chrome enforces a minimum window width, so
`--window-size` alone cannot produce a true 390px viewport) and can scroll,
hover and click before capturing.

`test-rows.mjs touch` passes `--blink-settings` to launch Chrome reporting
`hover: none` / `pointer: coarse`. `Emulation.setEmulatedMedia` cannot override
those two features. It will happily report success while `matchMedia` still
returns `true`, which makes for a green test that proves nothing. The test now
prints the live `matchMedia` values so the posture is verifiable rather than
assumed.

## Outstanding

- **Two logos missing** (Tomstar Industrial, The Scholarly Review). I could not
  verify their domains, and a wrong mark beside a real award is worse than none.
  Send the URLs and they can be added.
- **Competition dates** still need reconciling; see PLAN.md section 12.
- **The portrait is a tight crop of a group photo.** It works at avatar size,
  but the background is visible if it is ever shown larger; a clean portrait
  would upgrade it.
- **No resume download, deliberately.** The PDF carries a phone number, and the
  reference site has no download either.
