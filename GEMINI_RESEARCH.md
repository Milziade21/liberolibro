# Deep Research prompts for Gemini — structuring LiberoLibro

Paste each block into Gemini's Deep Research mode, one at a time. They are ordered:
data sources first, then chain-filtering, then the wider cultural map, then
legal/ethical, then architecture and sustainability. Each prompt is self-contained.

---

## 1. Data sources for independent bookshops in Italy

> Act as a research analyst mapping the independent bookselling sector in Italy.
> I am building an open, non-commercial map of **independent and second-hand
> bookshops** (explicitly excluding chains such as Feltrinelli, Mondadori,
> Giunti al Punto, Ubik, Libraccio, and Coop bookstores).
>
> Produce a structured report covering:
> 1. Every openly reusable dataset or directory that lists Italian bookshops with
>    names, addresses and (ideally) geographic coordinates — e.g. OpenStreetMap
>    (`shop=books`), regional cultural registries, ISTAT, the Ministero della
>    Cultura, ALI/Confcommercio, ANARPI (antiquarian booksellers), SIL, and any
>    regional "librerie indipendenti" associations.
> 2. For each source: license/terms of use, coverage completeness, update
>    frequency, data format, and whether an API or bulk download exists.
> 3. Known gaps — regions or bookshop types poorly represented in each source.
> 4. A recommendation on which 2–3 sources to combine for the widest coverage
>    with the least maintenance.
>
> Cite every source with a working URL. Prioritise official and openly-licensed
> sources over blog listicles.

---

## 2. Reliably distinguishing chains from independents

> I need a robust, maintainable method to automatically classify an Italian
> bookshop as either an **independent/second-hand** shop or part of a **chain**,
> starting only from its name and address.
>
> Deliver:
> 1. A comprehensive, current list of bookshop chains and franchises operating in
>    Italy (including affiliate/franchise brands like Giunti al Punto, Ubik,
>    Mondadori Bookstore, laFeltrinelli, Libraccio, Librerie.coop, Mel, Arion),
>    with the name variants and legal entities each trades under.
> 2. Edge cases: single historic shops that resemble chains (e.g. Hoepli,
>    Rizzoli Galleria), and franchise shops that are locally owned but branded.
>    Recommend how to treat each.
> 3. A concrete matching strategy (normalised string matching, brand keyword
>    blocklist, VAT/company-registry lookup) with its trade-offs and false-positive
>    risks.
>
> Output the chain list as a clean table I can turn into a code blocklist.

---

## 3. Mapping the wider counterculture: community spaces and underground events

> Extend the research to the rest of Italy's independent cultural infrastructure
> that seeks public visibility: self-managed social centres (centri sociali),
> "beni comuni" / civic-use spaces, community libraries and biblioteche popolari,
> squats and cultural associations (ARCI, ACLI), plus recurring underground events
> (self-produced festivals, book fairs, zine fairs, indie music circuits).
>
> Provide:
> 1. Structured, reusable sources listing these spaces and events with location
>    data — OpenStreetMap tags to use, national/regional networks, ARCI's club
>    directory, event platforms and calendars.
> 2. For events specifically: where to find machine-readable, forward-looking
>    schedules (iCal/RSS/JSON), and how to keep them current without manual entry.
> 3. The taxonomy dilemma: propose a clear, minimal category scheme that
>    distinguishes bookshops, community spaces and events without over-fragmenting.
>
> Cite sources with URLs and flag which are volatile (likely to disappear).

---

## 4. Legal and ethical constraints

> Assess the legal and ethical constraints for an open, non-commercial project
> that aggregates and republishes data about Italian bookshops, cultural spaces
> and events, hosted publicly and open-source.
>
> Cover:
> 1. Licensing obligations when redistributing OpenStreetMap data (ODbL) and how
>    attribution and share-alike apply to a derived JSON dataset.
> 2. GDPR considerations for listing venues, small businesses and organisers
>    (personal vs. business data, the right to be de-listed, contact info).
> 3. Terms-of-service limits and etiquette for the public Overpass and Nominatim
>    endpoints (rate limits, User-Agent, when self-hosting becomes necessary).
> 4. A short "safe defaults" checklist for staying compliant.
>
> Cite the relevant licences, regulations and usage policies directly.

---

## 5. Architecture, hosting and long-term sustainability

> Recommend a low-maintenance architecture for a public interactive map (currently
> a static HTML + Leaflet frontend, a single JSON data file, and a Node.js
> collector script that queries OpenStreetMap), to be hosted on **Railway**.
>
> Address:
> 1. Best-practice Railway setup for a Node static server plus a periodically-run
>    data-collection job (cron/scheduled task vs. build-time refresh vs. manual),
>    with cost implications on Railway's pricing.
> 2. When a flat JSON file stops scaling and what the lightest next step is
>    (SQLite, static tiles, a search index) — with the threshold (number of
>    records) that justifies each.
> 3. A community-contribution workflow that avoids running a backend: e.g.
>    GitHub pull requests, a form that opens an issue, or moderated submissions.
> 4. Data freshness and moderation: how comparable community maps (e.g. counter-
>    culture / mutual-aid maps, radical bookshop directories worldwide) keep data
>    current and prevent abuse.
>
> Where useful, include short comparisons to existing similar projects and cite them.
