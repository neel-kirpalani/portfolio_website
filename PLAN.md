# Portfolio plan

Status: direction locked, content pending. Last updated at kickoff.

## 1. The brief

- **Who:** High-school student at Hong Kong International School. Aspiring developer.
- **Goal:** Two readers at once: university admissions and internship recruiters.
- **Audience:** Decided: **both.** Projects lead; "Signals" (activities, leadership, competitions, coursework) is a real band rather than an afterthought, framed by what each thing demonstrates. Contact offers both a resume download and an email. Must survive a 30-second scan on a laptop and a phone.
- **Tone:** "Here's my trajectory", ambitious, specific, not inflated. No claims the work can't back up.
- **The ask:** Visually appealing, interactive, entertaining. Not a template.
- **Constraint:** Content is still being gathered. The plan must not depend on it.

### Why this shape

A student's project list is short and spread across school years. A "wall of
thumbnails" makes four projects look thin. A **catalogue** makes the same four
projects look like a *body of work*, because catalogues imply a slate, and the
year-by-year grouping turns "I only have a few projects" into "here is my
trajectory." That is the honest, flattering reading, and it is why the
streaming-UI idea works for this brief rather than just being a costume.

## 2. The concept: "The Catalogue"

Your own one-person studio's release slate. Not a Netflix skin.

We deliberately do **not** clone Netflix (red/black, Nintendo-adjacent condensed
type, a 10-second title card before any content). Three reasons:

1. You would be measured against Sumanth Samala's site forever rather than on your own terms.
2. The intro sting literally delays the one thing a recruiter came for: your work.
3. Red-on-black plus a fake streaming brand reads as a costume, not a point of view.

What we keep is the energy: **curated, cinematic, browsable, expandable.**

**The structural device:** projects are grouped into `Volume 01`, `Volume 02`, …
by school year. This is a real sequence rather than decoration; the numbering encodes
something true, and it scales as you add work through senior year.

**The signature element (the one memorable thing):** the site is genuinely
keyboard-navigable like a real catalogue UI. Arrow keys move a visible selector
across releases, `Enter` opens one. Hover a card and it expands into a muted
screen-recording preview with its metadata line. This is not a gimmick layered
on top. It is the interaction model, and it happens to be excellent for
keyboard and accessibility.

**Every title card carries catalogue metadata, mapped honestly:**

| Streaming UI | This site |
|---|---|
| Year | Year built |
| Runtime | Time to build (optional, only if it's interesting) |
| Rating | Award / grade / recognition, or omitted |
| Genre | Stack |
| Role | What you personally did; critical when work was a team effort |

That metadata row is the workhorse of the whole design. It is what makes the
catalogue conceit *informative* instead of atmospheric.

## 3. Design system

Deliberately not a copy of any reference: Brittany is blue-on-slate, Zach is
green-on-off-white, Radnaabazar is green-on-indigo, Sumanth is red-on-black.
No reference here uses amber, and amber carries the right meaning: projector
light, premiere, awards season, "this is worth your time."

**Color**

| Token | Value | Role |
|---|---|---|
| `bg` | `#0C0A0D` | Cinema-dark field. Near-black with a faint plum cast, neither pure black nor navy. |
| `surface` | `#16131A` | Cards, expanded states |
| `text` | `#F2EFE9` | Warm off-white. Filmic, not clinical. |
| `muted` | `#8B8593` | Metadata, secondary copy |
| `accent` | `#E8B84B` | Amber. The selector, the active state, link affordances. |
| `accent-dim` | `#6B5424` | Accent at rest / borders |

Exactly one accent. Restraint is what separates this from a theme park.

**Type** (via `next/font`, no layout shift)

- **Display:** Archivo (variable). Heavy weights, tight tracking, uppercase for title cards. Film-poster presence.
- **Body:** Instrument Sans. Humanist, readable, less default than Inter.
- **Mono:** JetBrains Mono. Metadata rows, volume labels, timestamps.

The type-scale contrast is the point: the name and titles are *enormous*, the
labels are *tiny, uppercase and letterspaced*. That contrast is what the
strongest references all share.

## 4. Structure

```
app/
  layout.tsx              fonts, metadata, theme
  page.tsx                The Catalogue: featured release + volume rows
  work/[slug]/page.tsx    Case study ("title detail")
  about/page.tsx
content/
  projects.ts             typed content objects; the single source of truth
  volumes.ts
components/
  catalogue/              Row, ReleaseCard, Selector, MetadataLine
  chrome/                 Nav, Footer, ContactRail
  motion/                 reveal primitives, reduced-motion guards
```

Routes stay deliberately few. A recruiter should be able to see everything
important on one page and go deeper only if they choose to.

**Page anatomy: The Catalogue**

1. **Hero:** a single featured release, presented like a trailer: oversized title, one-line premise, metadata line, `Watch` → case study. One project shown *beautifully* beats six shown small.
2. **Volume rows:** horizontal rows per school year, each a set of release cards. Hover/focus expands into preview + metadata.
3. **About:** short. Who you are, what you're into, HKIS, what you're looking for. Written like a person, not a LinkedIn summary.
4. **Signals:** activities, leadership, competitions, coursework. Framed by what it demonstrates, not as a list of titles.
5. **Contact:** email, GitHub, LinkedIn, resume. One obvious action.

## 5. Motion rules

Punctuation, not wallpaper. Every rule below has a guard.

- **Load sequence:** ≤1.5s, skippable, **skipped entirely on repeat visits** (sessionStorage). This is the Sumanth lesson learned properly: the sting is a garnish, never a gate.
- **Scroll:** rows and cards reveal with a short stagger. Nothing that blocks reading.
- **Hover/focus:** card expands, preview plays muted and loops.
- **Selector:** amber focus ring travels between releases; arrow keys move it.
- **`prefers-reduced-motion`:** all of the above collapse to instant state changes. Non-negotiable.

## 6. Quality floor

Not announced in the UI; just built in.

- Responsive to 320px. The catalogue rows become a vertical stack on mobile.
- Full keyboard operability with visible focus everywhere.
- Semantic landmarks, real headings, descriptive alt text.
- **Performance budget: LCP < 1.5s, no autoplaying video over ~2MB, previews lazy-loaded.** Bruno Simon's site showed me a black screen for 11+ seconds; Sumanth's was still on its title card. We are not doing that.
- No 3D. The spectacle comes from typography, motion and interaction, which are cheap and never break on a phone.

## 7. Build & deploy

- Next.js (App Router) + TypeScript + Tailwind + Motion.
- Content lives in typed TS objects in `content/`. Adding a project is editing one file, with no CMS and no database.
- Statically rendered where possible.
- Deploy to Vercel, custom domain when you have one.

## 8. What I need from you

The site is only as good as its content. Send what you can, in any format:

1. **Resume** (PDF is fine), and your activities/leadership list.
2. **Every project**, each with: name, one line on what it does and *why you built it*, year, stack, exactly what you did, live URL, repo URL.
3. **Visuals for each project:** screenshots or, much better, a short screen recording (5–15s, no audio). These drive the hover previews and the featured release.
4. **Accounts:** GitHub, LinkedIn, email you're happy to publish. Anything else real (Devpost, Kaggle, itch.io, ArtStation).
5. **A photo** if you want one on About. Optional, but it helps people connect.
6. **How you want to be described:** name as it should appear, pronouns, and a one-line positioning statement.
7. **HKIS context:** grade level and expected graduation year.
8. **A domain**, if you own one or want one.

### A note on privacy

You are a high-school student publishing to the open web. I will not put your
phone number, home address, or school schedule on the site. Contact goes
through email and a contact form. Worth deciding deliberately rather than by
accident.

## 9. Open decisions

- ~~**Primary target:** university admissions, internship recruiters, or both?~~ **Resolved: both.**
- **Writing section:** worth it only if you will actually write. An empty blog is worse than no blog.
- **Case-study depth:** one page per project, or an expanding panel? Depends on how much you want to write per project.
- **Real name vs. handle** as the site's title.

## 10. The narrative

Reading the resume and activity list as a whole, one through-line is already
there. It does not need inventing; it needs surfacing:

> **Every serious thing you have built takes messy real-world input, runs it
> through a model, and returns a signal a person can act on.**

| Project | Input | Model | Output |
|---|---|---|---|
| Skateboard safety system | IMU + GPS motion | trick-recognition pattern detection | jump height, landing force, live feedback |
| Environmental Impact app | camera frame | MobileNetV2 | eco score + disposal instructions |
| REMAKE | face image | shade / allergen / authenticity models | shade match, fake-product + allergen warnings |
| Lost & Found (hackathon) | lost-item report | matching + central database | retrieval |
| Robotics 936A | field state | control + match strategy | match outcome |
| AI displacement research | 20 academic studies | synthesis | reskilling strategy |

That is a portfolio about **instruments**: perception → interpretation →
decision. Even the non-technical work runs the same loop under time pressure,
a DJ reads a room and responds live; a team captain reads a match and calls a
play. That is not a stretch, it is the same skill.

This is the site's thesis and it should be legible within ten seconds of
landing. It is also the reason the catalogue framing fits: these are releases
from a studio whose whole practice is one thing.

## 11. Volumes, populated from real content

**Volume 01: 2023–24 (Grade 9)** · SDLT Hackathon, "Best Overall" (Lost &
Found system) · Environmental Impact Detection app begins · IBEL Robotics
outreach volunteer · Sai Kung Stray Friends · joins 936A Robotics

**Volume 02: 2024–25 (Grade 10)** · VEX Excellence Award · 3rd in Hong Kong ·
qualified for VEX Worlds · Stanford Robotics Open (15th) · 10th Grade Honor
Roll, GPA 3.82

**Volume 03: 2025–26 (Grade 11)** · REMAKE launches on the App Store · NYU
Tandon ML program · HKU AI summer course · HKIS Marketing internship (1 of 7
selected) · Tomstar Industrial web-dev internship · Kaggle, 113th of 4,382 ·
AI displacement research · Skateboard safety system · Team Captain, 936A

**Volume 04: 2026–27 (Grade 12)** · in progress

The arc is the point. Volume 01 is "joined a club"; Volume 03 is "shipped a
product with real users." That escalation is precisely what the volume
structure exists to reveal, and it is invisible in a flat project grid.

## 12. Content issues to resolve

- **REMAKE is on the activity list but not the resume.** A launched product
  with real users and revenue is your strongest single item and it is currently
  invisible on the document that matters most.
- **Tomstar internship and IBEL outreach appear only on the activity list.**
- **Research status is stated three different ways:** "working on" (resume),
  "peer reviewed" and "submitted for publication" (activity list). Pick the one
  that is literally true, use it everywhere. An overstated research claim is the
  easiest thing for a reader to check and the most expensive thing to get
  caught on.
- **Competition dates conflict.** The Hong Kong Tech Challenge appears twice as
  "2024–2025" with results dated 2026 and 2025; the Stanford Open is dated 2025
  in one place and 2024 in another. Reconcile before publishing.
- **The skateboard system reads as planned, not built**: "developing",
  "building", "designing", "implementing". Decide what actually runs today, and
  say that.
- **No phone number on the site.** Email, LinkedIn and resume only.
- **Kaggle: say "top 2.6%", not "113th of 4,382".** Same fact, correctly weighted.

## 13. Build status

Built and verified. `npm run dev` or `npm run build && npm start`.

Done:

- Design system as tokens in `app/globals.css`; nothing hard-codes a hex value.
- Home page: thesis hero, featured release (REMAKE), the catalogue in four
  volumes, About, Signals, Recognition, Contact.
- Case study route, statically generated per project.
- Keyboard navigation across the catalogue, with desired-column memory so
  moving into a shorter volume and back returns you where you started.
- Skippable 1.4s intro, shown once per session, skipped entirely under
  reduced motion.
- Verified with headless Chrome at 320 / 390 / 1440px: no horizontal overflow,
  headings fit, and the keyboard test suite passes.

Still needed before this is publishable:

1. **Project imagery.** The tile and panel gradients are placeholders. Screen
   recordings beat screenshots; the hover state is built to play them.
2. **Real GitHub / LinkedIn / Instagram URLs.** Left empty and hidden rather
   than linking to a site homepage.
3. **A redacted resume PDF** if a download link is wanted. The current file
   has a phone number on it.
4. **Reconciled competition dates** (section 12).
5. **A domain**, when one exists.
6. **A photo** for the About section, if wanted.

## 14. Redesign: from cinema-dark to paper-white

Feedback after seeing the first build, with a friend's site as the reference:

> "Make the site a bit more simple… it has good UI (doesn't just look like ai
> slop), the colors are nice. I prefer lighter colors."

**The criticism was fair.** The first build was huge uppercase Archivo, amber on
near-black, projector bloom, film grain and ghosted catalogue numbers. That
combination (near-black field, one saturated accent, giant display type) is
one of the recognisable generated-design clusters. It looked like a template
because it was assembled from the same parts as one.

**What changed**

- Light throughout: `#FFFFFF` paper, `#17171A` ink, hairline rules.
- **No accent colour at all.** Colour now comes only from real organisation
  logos in the rows, which is what gives the reference site its life without a
  "brand palette".
- Serif name and section headings (Newsreader), neutral sans body.
- **Cut:** the title-card intro, film grain, projector bloom, ghosted numbers,
  the VOLUME 01–04 conceit, and the custom arrow-key grid widget.
- Layout is now the reference's: sticky bio column left, lists right, rows
  expand in place.

**What survived, and why**

- **The narrative.** "Projects that turn a messy real-world signal into
  something a person can act on" is still the first line of the bio. It was
  never the problem.
- **The case-study routes.** Depth is still one click away, statically
  generated per project.
- **Accessibility discipline.** Rows are real buttons with `aria-expanded`, so
  the interaction got *simpler* and *more* accessible at the same time.
- **The verification loop.** Everything below was re-checked at 320, 390 and
  1440px, and the interaction test still runs.

**A lesson worth recording:** the reference site's charm comes largely from
logos of real products. Fetching them by guessing domains produced a generic
`.com` placeholder for `tomstar.com` and an unrelated publication for
`thescholarlyreview.com`. Both were caught by looking at the images rather than
trusting a 200 response. Neither is used. Two rows deliberately have no mark.
