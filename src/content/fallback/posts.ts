import type { Author, Post } from "@/types/content";

/**
 * Blog seed data. Bodies are Markdown, rendered by `@/lib/markdown` — the same
 * renderer handles Sanity-authored posts, so the reading experience is
 * identical regardless of source.
 */

const author: Author = {
  name: "Muhammad Fajar Ariandi",
  role: "Designer, Developer & IoT Engineer",
  avatar: { url: "", alt: "Muhammad Fajar Ariandi", width: 200, height: 200 },
};

export const posts: Post[] = [
  {
    title: "Using AI as a Build Tool, Not a Shortcut",
    slug: "ai-as-a-build-tool",
    excerpt:
      "The useful divide isn't 'AI or no AI' — it's which parts of the work are mechanical and which parts need judgement. Getting that line right is most of the skill.",
    body: `There's a version of the AI conversation that's about whether to use it at all. That framing is a dead end. The question that actually changes your output is narrower: **which parts of this work are mechanical, and which parts need judgement?**

## Mechanical work is anything with a verifiable answer

Configuring a router has a correct answer. So does a regex, a Dockerfile, or the twentieth variant of a card component. These tasks share a property: you can tell whether the result is right without much argument.

That's exactly the work worth handing over. Not because it's easy — some of it is fiddly — but because the cost of being wrong is low and the feedback loop is fast.

## Judgement work is where the value is

The opposite end: deciding what the product should do, choosing what to leave out, working out why a user is confused. There's no verifiable answer, which means there's nothing for a model to check itself against.

This is where attention pays. And the practical benefit of handing off the mechanical work is that it frees exactly that attention.

## The failure mode

The failure I see most often isn't bad generated code. It's generated code accepted without reading, in a domain the person doesn't understand well enough to evaluate.

The rule I use: **don't delegate work you can't review.** If I couldn't spot a subtly wrong answer, I'm not delegating the task — I'm outsourcing the understanding. That's the difference between moving faster and accumulating debt.

> Speed you can't verify isn't speed. It's just debt with a shorter feedback loop.

## What this looks like in practice

A concrete example from a recent project. I needed a set of components with consistent spacing and accessible states across a fairly large surface.

- **Delegated:** the repetitive variants, the boilerplate, the first pass at edge-case states.
- **Kept:** the token decisions, the component API, what the states should be, and every review.
- **Result:** roughly a day of work compressed into a few hours, with the design decisions still made deliberately rather than by default.

The output quality was the same or slightly better — mostly because the mechanical parts got consistent attention instead of whatever was left at the end of a long day.

## The honest caveat

None of this makes hard problems easy. It makes tedious problems fast. If the bottleneck is thinking, no tool removes it — and treating AI as a way to skip thinking is the fastest way to ship something you don't understand.`,
    cover: { url: "", alt: "Abstract visualisation of AI-assisted development", width: 1600, height: 900 },
    category: "AI",
    tags: ["AI", "Workflow", "Engineering", "Productivity"],
    author,
    publishedAt: "2025-11-18",
    readingMinutes: 6,
    featured: true,
  },
  {
    title: "Why I Still Learn Networking Before Frameworks",
    slug: "networking-before-frameworks",
    excerpt:
      "Every web developer eventually debugs a network problem. The ones who understand layers 1–4 do it in minutes instead of days.",
    body: `I started in networking. For a couple of years my job was running cable, configuring routers, and working out why a link that tested fine in the morning was dropping packets by the afternoon.

When I moved into web development, I assumed that background was behind me. It turned out to be the most portable thing I'd learned.

## Abstraction is a promise, not a guarantee

The web stack is a tower of abstractions, and each one is a promise that the layer below will behave. Frameworks assume the network works. TLS assumes DNS resolved. DNS assumes routing.

Those promises hold almost all the time — which is exactly what makes the failures so expensive. When something breaks below your abstraction, you can't debug it by reading the framework's docs.

## The concrete version

A real example. An app worked locally and timed out in production, only for some users.

- **At the framework layer:** nothing wrong. Logs showed slow queries. The instinct was to optimise the database.
- **At the network layer:** the affected users were on a different route with a smaller MTU. Large responses were fragmenting and being dropped silently.

The fix had nothing to do with the application. The people who found it fast weren't better developers — they just had a mental model that included the layers underneath.

## What's actually worth knowing

You don't need to be a network engineer. You need enough to reason about where a problem lives:

1. **DNS** — resolution order, TTLs, the difference between a record not existing and not propagating.
2. **TCP and TLS** — handshakes, timeouts, what a certificate error actually means.
3. **Routing and NAT** — enough to read a traceroute and know what it's telling you.
4. **MTU and fragmentation** — the source of a whole genre of "works for me" bugs.
5. **Packet capture** — when in doubt, look at the actual traffic.

That's a weekend of reading. It pays back the first time you're on a call at 2am and someone asks whether the problem is the app or the network.

## The broader point

The abstraction layers are someone else's decisions, frozen. Understanding one layer down means you can tell the difference between a bug in your code and a bug in your assumptions — and that's most of the work.`,
    cover: { url: "", alt: "Network topology visualisation", width: 1600, height: 900 },
    category: "Networking",
    tags: ["Networking", "Fundamentals", "Debugging", "Career"],
    author,
    publishedAt: "2025-10-02",
    readingMinutes: 7,
    featured: true,
  },
  {
    title: "Deploying IoT Where the Network Is Unreliable",
    slug: "iot-on-unreliable-networks",
    excerpt:
      "Most IoT guidance assumes good connectivity. Here's what changes when the link is intermittent, slow, or expensive.",
    body: `Most IoT tutorials assume a stable connection. In the deployments I've worked on, that assumption is the first thing to go.

When a device is on a satellite link with intermittent availability, or a cellular connection metered by the megabyte, the design constraints invert completely.

## Constraint one: assume every message may not arrive

If the link drops, you have two choices: buffer locally and retry, or lose the data. For anything that matters, it has to be the first.

This means the device needs local storage and a queue that survives a power cycle. In practice:

- Write to local storage **before** attempting to transmit
- Only remove on confirmed acknowledgement
- Bound the queue so a long outage doesn't fill the disk — and decide deliberately what gets dropped when it's full

## Constraint two: bandwidth is a budget

On a metered link, every byte has a cost and a power implication. The instinct to report every reading every second is usually wrong.

What works better is **edge filtering** — the device decides what's worth sending. Report on change, report on threshold crossing, and send a periodic heartbeat so you can distinguish "nothing to report" from "device is down." Those two states look identical if you only send on events.

## Constraint three: the device must survive alone

Remote sites mean a site visit costs hours. Devices need to recover from faults without a human:

- **Watchdog timer** that reboots the device if the main loop hangs
- **Fail-safe state** — decide what happens when the link is down, rather than leaving it undefined
- **Config that survives a firmware update**, so a failed update doesn't require re-provisioning

## Constraint four: time is unreliable too

Devices without a real-time clock or NTP will drift, and worse, they'll **reset to epoch on reboot**. Timestamps from an unreliable device are a trap — data that looks plausible but is silently wrong.

The fix is to treat device time as a hint and timestamp on ingestion, or sync properly and record the sync status alongside the reading so you know which timestamps to trust.

## The design principle underneath

Design for the link being down, and everything else follows. Once you assume the network is a rare privilege rather than a constant, the architecture stops being about real-time streaming and becomes about **durability and reconciliation** — which, it turns out, is a more honest model for most distributed systems anyway.`,
    cover: { url: "", alt: "IoT device deployment in the field", width: 1600, height: 900 },
    category: "IoT",
    tags: ["IoT", "Networking", "Reliability", "Architecture"],
    author,
    publishedAt: "2025-08-21",
    readingMinutes: 8,
    featured: false,
  },
  {
    title: "From Field Technician to Full-Stack Developer",
    slug: "field-technician-to-developer",
    excerpt:
      "The path wasn't a leap. It was a series of small, unglamorous steps that compounded — and the field work was never wasted.",
    body: `People ask how I moved from installing networks to building software, usually expecting a story about a decisive career break. There wasn't one. It was incremental, and most of it happened on evenings and weekends.

## The starting point

My first roles were hands-on: parcel operations, then Windows deployment and IT support, then fibre and wireless installation. Practical work with visible results — a link that didn't work now works.

What I didn't appreciate at the time was that I was accumulating something useful. I was learning how systems fail in the real world, which is knowledge you cannot get from a tutorial.

## The first step was small and specific

Not "learn to code" — that goal is so large it's paralysing. Instead: **automate one annoying part of my actual job.**

For me it was a repetitive configuration task. I wrote a script that was genuinely bad. It worked maybe 70% of the time. But it was mine, and fixing it taught me more than any course had.

The lesson: pick a real problem, accept an ugly first version, and let the fixing teach you.

## What the field work actually gave me

The transition felt like starting over. It wasn't. Three things carried directly across:

**Debugging temperament.** Field work teaches you to form a hypothesis and test it cheaply before committing to an expensive action. That's the same loop as debugging software, just with higher stakes and worse weather.

**Systems thinking.** You can't configure a router in isolation — you have to consider what's upstream, what's downstream, and what breaks when this piece changes. That's architecture.

**Explaining to non-experts.** I spent years explaining connectivity problems to people who didn't care about the mechanism, only the outcome. That's exactly the skill for writing documentation and reviewing interfaces.

## What I had to build from scratch

Being honest about the gaps matters more than the encouraging part:

- **Patience with abstraction.** I was used to seeing the whole system. Learning to work inside someone else's abstraction — and trust it until proven otherwise — took real adjustment.
- **Reading other people's code.** Far harder than writing your own, and unavoidable.
- **Design.** I could make things work long before I could make them clear. That gap closed by studying work I admired and copying it deliberately.

## The part that actually mattered

Consistency. Not intensity — consistency. An hour most evenings for a couple of years beats a heroic month every time, because the compounding is in the reps.

If you're in a hands-on role and want to move toward building software: you're not starting from zero. You're starting from a position most developers would pay for. You just have to notice what you already know.`,
    cover: { url: "", alt: "Abstract visualisation of a career path", width: 1600, height: 900 },
    category: "Career Journey",
    tags: ["Career", "Learning", "Growth", "Networking"],
    author,
    publishedAt: "2025-06-14",
    readingMinutes: 7,
    featured: false,
  },
  {
    title: "Designing Dark Interfaces That Don't Feel Like a Black Hole",
    slug: "designing-dark-interfaces",
    excerpt:
      "Dark mode is not inverted light mode. Depth, contrast, and saturation all behave differently — and the usual rules will fail you.",
    body: `Dark interfaces are fashionable, and most of them are worse than the light version they replaced. The problems are consistent and fixable, but only if you stop treating dark mode as a colour inversion.

## Depth has to be built, not borrowed

In a light interface, depth comes from shadow — a dark object on a light background reads as raised. **On a dark background that stops working.** You cannot cast a shadow into a void.

Depth in dark UIs comes from **lightness**. A raised surface is lighter than the one behind it, because it's catching more light. This means:

- Your base surface should not be pure black
- Each elevation step gets incrementally lighter
- Borders do more work than shadows ever did

Pure black (\`#000000\`) is usually the wrong base. It leaves nowhere to go darker, and it makes text shimmer against the high contrast.

## Contrast is not the goal

There's a reflex to push contrast as high as possible — pure white text on pure black. It passes every accessibility check and is genuinely unpleasant to read for more than a minute.

The reason is halation: bright text on a dark field appears to bloom and smear, especially for readers with astigmatism. Off-white text — something in the \`#E2E8F0\` range — is easier on the eye and still comfortably passes AA.

**Accessibility is a floor, not a target.** Passing the ratio doesn't mean it's comfortable.

## Saturation behaves differently

A saturated colour that looks confident on white looks radioactive on black. The same hex code, different perceptual result.

The fix is to **desaturate and lighten accents** for dark backgrounds. A blue that works on white often needs to lose 10–20% saturation and gain lightness to feel equally confident on black.

## Text hierarchy needs more room

On light backgrounds, you can distinguish levels of text with small changes in grey. On dark, those differences compress and the hierarchy flattens.

You need **larger steps** between primary, secondary, and muted text. Where light mode might use \`#111\`, \`#555\`, \`#888\`, dark mode needs more spread — and a weight change as well, not just colour, to keep the hierarchy legible.

## The check that catches most of it

Squint at the interface, or better, view it at 30% brightness on a laptop in a lit room. If the structure survives that, the depth is real rather than carried by contrast alone.

Dark mode is not a filter. It's a separate design pass with its own physics — and treated that way, it can be genuinely better than the light version instead of just dimmer.`,
    cover: { url: "", alt: "Dark interface design study", width: 1600, height: 900 },
    category: "Web Development",
    tags: ["Design", "CSS", "Accessibility", "UI"],
    author,
    publishedAt: "2025-04-09",
    readingMinutes: 6,
    featured: false,
  },
  {
    title: "What Actually Makes a Website Fast",
    slug: "what-makes-a-website-fast",
    excerpt:
      "Most performance work is spent on the wrong things. The wins are usually structural — and they happen before you optimise anything.",
    body: `Performance advice tends to arrive as a list of micro-optimisations. In practice, the largest wins are structural decisions made long before anyone profiles anything.

## The order of impact

Working from largest to smallest effect:

**1. How much JavaScript you ship.** This dominates. Every kilobyte of JS is parse, compile, and execute time on a device slower than yours. Frameworks that ship less, and pages that need less interactivity, win here before any tuning.

**2. When it ships.** Render on the server, send HTML, and let the page be readable before the JS arrives. A page that renders without JS is fast by construction.

**3. What you load eagerly.** Images below the fold, fonts you don't use, third-party scripts on every page. Defer, lazy-load, and delete.

**4. Then, actual optimisation.** Bundling, caching, compression, CDN. Real wins, but they're a fraction of the above.

Most teams start at 4. It's the easiest to measure and the least consequential.

## Measure on the right device

The single most common mistake: profiling on a fast laptop over fast wifi and concluding the site is fast.

The people who experience your site as slow are on mid-range Android devices on congested mobile networks. Chrome DevTools throttling — 4x CPU slowdown, Slow 4G — is a rough approximation but far closer to reality than an unthrottled MacBook.

## The metrics that matter

- **LCP** — how long until the main content is visible
- **INP** — how quickly the page responds to interaction
- **CLS** — how much the layout moves while loading

CLS is the most commonly neglected and the most irritating. It's almost always caused by images without dimensions or fonts without a fallback metric — both trivial to fix and both cause the page to jump under the reader's cursor.

## The uncomfortable conclusion

If a site is slow, the honest diagnosis is usually "we shipped too much JavaScript." That's a structural decision, not a tuning parameter. No amount of compression fixes an architecture that sends a megabyte of script to render text.

Performance is mostly a design constraint you accept at the start, not a cleanup task at the end.`,
    cover: { url: "", alt: "Performance profiling visualisation", width: 1600, height: 900 },
    category: "Web Development",
    tags: ["Performance", "Web Vitals", "Frontend", "Architecture"],
    author,
    publishedAt: "2025-02-27",
    readingMinutes: 6,
    featured: false,
  },
];
