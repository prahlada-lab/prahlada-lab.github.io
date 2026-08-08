/*
 * Prahlada site search.
 *
 *   1. Utilities        — text normalisation, tokenising, slugs
 *   2. Corpus           — static page copy + papers.json, compiled to an inverted index
 *   3. Query            — parsing, scoring (BM25-flavoured), result cache
 *   4. Snippets         — cropped, highlight-marked excerpts
 *   5. View model       — palette-ready rows (paint + handlers)
 *   6. Page helpers     — eased scrolling, background scroll lock
 *
 * Public API: window.PrahladaSearch = { build, query, view, slug, ready, scrollToY, lockScroll }
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- 1. utilities */

  // Pages are `.dc.html` inside the design tool and `.html` once deployed.
  const EXT = (typeof location !== "undefined" && location.pathname.indexOf(".dc.html") > -1) ? ".dc.html" : ".html";
  const page = (p) => String(p || "").replace(/\.html$/, EXT);

  const slug = (s) =>
    String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);

  // Lowercase, strip accents and apostrophes so "Pilani's" ≈ "pilanis".
  const norm = (s) =>
    String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "");

  const toks = (s) => norm(s).match(/[a-z0-9]+/g) || [];

  // Dropped from a query when it also carries meaningful terms.
  const STOP = new Set(("a an the of for and or to in on at is are we our with from by as it its this that " +
    "be can do does not but how what why which").split(" "));

  /* ------------------------------------------------------------------- 2. corpus */

  // Field weights: a hit in a title outranks a hit deep in an abstract.
  const FIELDS = [["title", 3.2], ["people", 2.6], ["meta", 1.9], ["body", 1.0]];

  // Page shortcuts, shown when the query is empty.
  const PAGES = [
    { kind: "Page", title: "culture", subtitle: "who we are, how we work", page: "index.html", hash: "" },
    { kind: "Page", title: "research", subtitle: "focus areas, papers and blogs", page: "research.html", hash: "" },
    { kind: "Page", title: "paper dives", subtitle: "reading group sessions", page: "paper-dives.html", hash: "" }
  ];

  // Copy that lives in the pages themselves rather than in papers.json.
  const STATIC = [
    { kind: "Culture", title: "About us", page: "index.html", hash: "about-us",
      body: "We are a Student-first AI Lab. We empower students to take on and lead projects which they find cool and exciting, no matter how technically challenging it seems. Having Fun is important for us. We are dedicated to ensuring a very high degree of reproducibility for all our projects. Through releasing not only Training Code and Datasets, but also detailed blogs explaining our negative results and how we got it to work. We want to build a small community at BITS Pilani, which is filled with people who are very aware of what is the Frontier of the field they are working on and have regular discussions on the same. We aim to differentiate ourselves through our seriousness to meet very high research standards." },
    { kind: "Culture", title: "A Student-led and a Student-first AI Lab", page: "index.html", hash: "",
      body: "Filling gaps in the Indic open source ecosystem — from BITS Pilani. Vidya Dadati Vinayam. Knowledge Gives Humility. Prahlada." },
    { kind: "Research", title: "Filling Gaps in the Indic Open Source Ecosystem", page: "research.html", hash: "focus-areas",
      body: "Alignment and Safety Audits. Automated Red Teaming and Jailbreaking. Safety Fine-tuning and Unlearning. Remedying Cross cultural Reasoning Transfer Deficiencies. Interpretability Approaches for Indic Performance Deficiencies. Synthetic Problem Generation for High-Complexity STEM. Memory and Continual Learning." },
    { kind: "Research", title: "Why can students build better models?", page: "research.html", hash: "why-students",
      body: "More willingness to do non-flashy work in order to improve the final model. People new to building AI can be free of prior phases of AI hype cycles, allowing them to adapt to new modern techniques faster. Less ego enabling org charts to scale slightly as there is less gamifying the system. Abundant talent well-suited to building things with a proof-of-concept elsewhere." },
    { kind: "Research", title: "Why to even train our own models?", page: "research.html", hash: "why-train",
      body: "Strategic Open Source. We see a gap we can fill, and a reason we believe we can do better. We want to build things that are useful to the Indic open source ecosystem. Our goal is not the best model ever. It is to create value in the Indic Open Source Ecosystem — building something Indian developers would actually want to adopt. Research is a small secondary objective. Engineering first, Science Second." },
    { kind: "Paper dives", title: "How we read papers", page: "paper-dives.html", hash: "",
      body: "We take paper reading and discussion seriously. These are the papers we have covered, with notes from the session each was presented in." }
  ];

  let docs = [];              // [{ kind, title, page, hash, raw:{...}, all }]
  let postings = new Map();   // token -> [{ d, w, tf }]  (one entry per doc+field)
  let vocab = [];             // sorted unique tokens, for prefix and fuzzy scans
  const cache = new Map();    // query string -> results (capped)

  function makeDoc(d) {
    return {
      kind: d.kind, title: d.title, page: page(d.page), hash: d.hash || "",
      raw: {
        title: d.title || "", people: d.people || "", meta: d.meta || "",
        body: (d.body || "") + (d.subtitle ? " " + d.subtitle : "")
      },
      all: "" // filled in by index()
    };
  }

  /* Compile every doc's fields into the inverted index. Runs once per build. */
  function index() {
    postings = new Map();
    const seen = new Set();
    docs.forEach((d, i) => {
      d.all = norm([d.raw.title, d.raw.people, d.raw.meta, d.raw.body].join(" "));
      FIELDS.forEach(([key, w]) => {
        const counts = new Map();
        for (const t of toks(d.raw[key])) counts.set(t, (counts.get(t) || 0) + 1);
        counts.forEach((tf, t) => {
          let list = postings.get(t);
          if (!list) { list = []; postings.set(t, list); seen.add(t); }
          list.push({ d: i, w, tf });
        });
      });
    });
    vocab = Array.from(seen).sort();
    cache.clear();
  }

  function build(data) {
    const d = data || {};
    docs = STATIC.map(makeDoc);
    (d.papers || []).forEach((p) => docs.push(makeDoc({
      kind: "Paper", title: p.title, page: "research.html", hash: slug(p.title),
      people: (p.authors || []).map((a) => a.name).join(", "),
      meta: [p.status, p.venue, p.topic, p.date].filter(Boolean).join(" "),
      body: p.abstract || ""
    })));
    (d.blogs || []).forEach((b) => docs.push(makeDoc({
      kind: "Blog", title: b.title, page: "research.html", hash: slug(b.title),
      people: (b.authors || []).map((a) => a.name).join(", "),
      meta: [b.kind, b.topic, b.date].filter(Boolean).join(" ")
    })));
    (d.dives || []).forEach((v) => docs.push(makeDoc({
      kind: "Dive", title: v.title, page: "paper-dives.html", hash: slug(v.title),
      people: v.presenter || "",
      meta: [v.venue, v.topic, v.date].filter(Boolean).join(" ")
    })));
    index();
    return docs.length;
  }

  /* -------------------------------------------------------------------- 3. query */

  const saturate = (tf) => tf / (tf + 1.15);          // diminishing returns on repeats
  const lowerBound = (t) => {                         // first vocab index >= t
    let lo = 0, hi = vocab.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (vocab[m] < t) lo = m + 1; else hi = m; }
    return lo;
  };

  /* Edit distance <= 1, without building a matrix. */
  function near(a, b) {
    if (a === b) return true;
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    let i = 0, j = 0, diff = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
    }
    return true;
  }

  function parseQuery(q) {
    const phrases = [];
    const rest = String(q || "").replace(/"([^"]+)"/g, (_, p) => {
      const t = norm(p).trim();
      if (t) phrases.push(t);
      return " ";
    });
    const terms = toks(rest);
    const kept = terms.filter((t) => !STOP.has(t));
    return { terms: kept.length ? kept : terms, phrases };
  }

  /*
   * Per-term score for every doc, read straight off the posting lists:
   * exact hits at full value, prefix hits at 0.6, fuzzy hits at 0.3 (fuzzy pass only).
   * Returns a Map docIndex -> best field score for this term.
   */
  function termScores(t, fuzzy) {
    const out = new Map();
    const add = (list, factor) => {
      for (const p of list) {
        const s = saturate(p.tf * factor) * p.w;
        if (s > (out.get(p.d) || 0)) out.set(p.d, s);
      }
    };
    const exact = postings.get(t);
    if (exact) add(exact, 1);
    if (t.length >= 2) {
      for (let i = lowerBound(t); i < vocab.length; i++) {
        const v = vocab[i];
        if (v.indexOf(t) !== 0) break;
        if (v !== t) add(postings.get(v), 0.6);
      }
    }
    if (fuzzy && !out.size && t.length >= 4) {
      for (const v of vocab) if (near(v, t)) add(postings.get(v), 0.3);
    }
    return out;
  }

  /*
   * Three passes, stopping at the first that finds anything:
   *   all   — every term must hit (precise)
   *   fuzzy — same, but a term may hit within one typo
   *   any   — union of terms (last resort)
   */
  function rank(terms, phrases) {
    for (const mode of ["all", "fuzzy", "any"]) {
      const totals = new Map(), hitCount = new Map();
      const bump = (i, s) => {
        totals.set(i, (totals.get(i) || 0) + s);
        hitCount.set(i, (hitCount.get(i) || 0) + 1);
      };
      for (const ph of phrases) docs.forEach((d, i) => { if (d.all.indexOf(ph) > -1) bump(i, 5); });
      for (const t of terms) termScores(t, mode === "fuzzy").forEach((s, i) => bump(i, s));

      const need = terms.length + phrases.length;
      const hits = [];
      totals.forEach((s, i) => {
        if (mode === "all" || mode === "fuzzy" ? hitCount.get(i) === need : s > 0) hits.push({ i, s });
      });
      if (hits.length) {
        hits.sort((a, b) => b.s - a.s || docs[a.i].title.localeCompare(docs[b.i].title));
        return hits;
      }
    }
    return [];
  }

  /* ----------------------------------------------------------------- 4. snippets */

  const SNIPPET = 190;

  /* Split `text` into { text, hit } runs so the palette can highlight matches. */
  function parts(text, needles, focus) {
    if (!text) return [];
    let start = 0;
    if (focus) {
      const i = norm(text).indexOf(focus);
      if (i > 90) { const sp = text.lastIndexOf(" ", i - 70); start = sp > 0 ? sp + 1 : i - 70; }
    }
    let cut = text.slice(start, start + SNIPPET);
    if (start > 0) cut = "… " + cut;
    if (start + SNIPPET < text.length) cut += " …";

    const esc = needles.filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length);
    if (!esc.length) return [{ text: cut, hit: false }];

    const re = new RegExp("(" + esc.join("|") + ")", "ig");
    const out = [];
    let last = 0, m, guard = 0;
    while ((m = re.exec(cut)) && guard++ < 60) {
      if (m.index > last) out.push({ text: cut.slice(last, m.index), hit: false });
      out.push({ text: m[0], hit: true });
      last = m.index + m[0].length;
    }
    if (last < cut.length) out.push({ text: cut.slice(last), hit: false });
    return out;
  }

  /* Prefer the abstract, then people, then venue/date as the excerpt source. */
  function excerpt(d, needles) {
    for (const n of needles) {
      for (const key of ["body", "people", "meta"]) {
        if (d.raw[key] && norm(d.raw[key]).indexOf(n) > -1) return { text: d.raw[key], focus: n };
      }
    }
    return { text: d.raw.body || d.raw.people || d.raw.meta, focus: null };
  }

  const MAX_ROWS = 10;

  function query(q) {
    const key = String(q || "");
    const hit = cache.get(key);
    if (hit) return hit;

    const { terms, phrases } = parseQuery(key);
    let out;
    if (!terms.length && !phrases.length) {
      out = PAGES.map((p) => ({
        kind: p.kind, title: p.title, page: page(p.page), hash: p.hash,
        titleParts: [{ text: p.title, hit: false }],
        parts: [{ text: p.subtitle, hit: false }]
      }));
      out.total = out.length;
      out.empty = true;
    } else {
      const hits = rank(terms, phrases);
      const needles = phrases.concat(terms);
      out = hits.slice(0, MAX_ROWS).map(({ i }) => {
        const d = docs[i];
        const src = excerpt(d, needles);
        return {
          kind: d.kind, title: d.title, page: d.page, hash: d.hash,
          titleParts: parts(d.title, needles, null),
          parts: parts(src.text, needles, src.focus)
        };
      });
      out.total = hits.length;
      out.empty = false;
    }

    if (cache.size > 60) cache.clear();
    cache.set(key, out);
    return out;
  }

  /* --------------------------------------------------------------- 5. view model */

  const HIT = { bg: "#F2E6C9", fg: "#003B6F", w: 600 };
  const PLAIN = { bg: "transparent", fg: "inherit", w: "inherit" };
  const paint = (p) => ({ text: p.text, ...(p.hit ? HIT : PLAIN) });

  /*
   * Palette-ready rows for the current query and selection.
   * `handlers` supplies onHover(index) and onOpen(row); the result also carries
   * `.total` (matches before the display cap) and `.empty` (no query typed).
   */
  function view(q, sel, handlers) {
    const raw = query(q);
    const active = Math.min(sel || 0, Math.max(raw.length - 1, 0));
    const rows = raw.map((r, i) => {
      // The row (not the raw doc) is what gets handed to onOpen — it carries href.
      const row = {
      kind: r.kind, title: r.title, page: r.page, hash: r.hash,
      href: r.page + (r.hash ? "#" + r.hash : ""),
      titleParts: r.titleParts.map(paint),
      parts: r.parts.map(paint),
      hasBody: r.parts.some((p) => p.text && p.text.trim()),
      bg: i === active ? "#E3F1FB" : "transparent",
      edge: i === active ? "#C6A15B" : "transparent",
      hover: () => handlers.onHover(i),
      go: (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser open a tab
        e.preventDefault();
        handlers.onOpen(row);
      }
      };
      return row;
    });
    rows.total = raw.total;
    rows.empty = raw.empty;
    rows.countLabel = raw.empty ? "jump to" : (raw.total ? raw.total + (raw.total === 1 ? " result" : " results") : "no results");
    return rows;
  }

  /* -------------------------------------------------------------- 6. page helpers */

  let raf = null;

  /* Eased scroll — `behavior:"smooth"` is unreliable in embedded frames. */
  function scrollToY(y, dur) {
    const start = window.scrollY || 0;
    const max = Math.max(document.body.scrollHeight - window.innerHeight, 0);
    const dist = Math.min(Math.max(y, 0), max) - start;
    if (Math.abs(dist) < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, start + dist);
      return;
    }
    const ms = dur || Math.min(Math.max(Math.abs(dist) * 0.55, 380), 900);
    const t0 = performance.now();
    if (raf) cancelAnimationFrame(raf);
    const step = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, start + dist * e);
      raf = p < 1 ? requestAnimationFrame(step) : null;
    };
    raf = requestAnimationFrame(step);
  }

  let savedY = 0;

  /*
   * Freeze the page behind the palette. Root-level `overflow:hidden` alone
   * still lets wheel and touch drags through in some engines, so the body is
   * pinned at its current offset and the scroll position restored on close.
   */
  function lockScroll(on) {
    const b = document.body, root = document.documentElement;
    if (on) {
      savedY = window.scrollY || 0;
      const sbw = window.innerWidth - root.clientWidth;
      b.style.position = "fixed";
      b.style.top = -savedY + "px";
      b.style.left = "0";
      b.style.right = "0";
      b.style.width = "100%";
      if (sbw > 0) b.style.paddingRight = sbw + "px";
    } else {
      b.style.position = "";
      b.style.top = "";
      b.style.left = "";
      b.style.right = "";
      b.style.width = "";
      b.style.paddingRight = "";
      window.scrollTo(0, savedY);
    }
  }

  window.PrahladaSearch = { build, query, view, slug, scrollToY, lockScroll, ready: () => docs.length > 0 };
})();
