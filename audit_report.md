# 3DPrintMap — Technical SEO Audit Report
**Site:** https://www.3dprintmap.com
**Date:** 2026-03-20
**Pages audited:** 1,088 (all HTML files across public/, public/blog/, public/listing/)
**Method:** Full static file analysis + live URL verification

---

## Summary Scorecard

| Area | Status | Severity |
|---|---|---|
| robots.txt | ✅ Pass | — |
| noindex tags | ✅ Pass | — |
| Canonical vs. served URL mismatch | ❌ Fail — 51 pages | Critical |
| Duplicate title tags | ⚠ Warning — 23 listing pages | High |
| Missing H1 on directory page | ⚠ Warning | Medium |
| JSON-LD missing on 6 pages | ⚠ Warning | Medium |
| Title tag length violations | ⚠ Warning — 2 pages | Low |
| Twitter card image missing | ⚠ Warning — 6 pages | Low |
| AI citation readiness | ⚠ Partial | Medium |

---

## 1. robots.txt — PASS ✅

```
User-agent: *
Allow: /
Sitemap: https://3dprintmap.com/sitemaps/sitemap.xml
```

**Findings:**
- No bots are blocked. All crawlers including Googlebot, GPTBot, ClaudeBot, and PerplexityBot have full access.
- Sitemap URL is correctly declared.

**Note:** The sitemap is at `/sitemaps/sitemap.xml`, not the conventional `/sitemap.xml`. A redirect is configured in `vercel.json` to handle `/sitemap.xml → /sitemaps/sitemap.xml`, but ensure Google Search Console is pointing to the correct URL when you submit it.

---

## 2. noindex Tags — PASS ✅

- **0 of 1,034** pre-rendered listing pages carry a `noindex` directive.
- All core pages carry `<meta name="robots" content="index, follow">`.
- No pages are accidentally blocking indexing.

---

## 3. Canonical URL Mismatch — CRITICAL ❌

**51 pages** declare canonical URLs ending in `.html`, but `cleanUrls: true` in `vercel.json` causes Vercel to serve these pages at URLs **without** the `.html` extension. Google will see a mismatch between the canonical tag and the URL it actually crawled.

**Example:**
```html
<!-- What the canonical tag says: -->
<link rel="canonical" href="https://www.3dprintmap.com/directory.html">

<!-- What Vercel actually serves the page at: -->
https://www.3dprintmap.com/directory
```

Google treats this as a hint conflict and may choose its own canonical — undermining all your link equity signals.

**Affected pages:**
- `/directory.html` → served as `/directory`
- `/fdm-printing.html` → served as `/fdm-printing`
- `/sla-resin.html` → served as `/sla-resin`
- `/sls-nylon.html` → served as `/sls-nylon`
- `/metal-printing.html` → served as `/metal-printing`
- `/technologies.html` → served as `/technologies`
- `/faq.html` → served as `/faq`
- `/about.html` → served as `/about`
- `/recommended-gear.html` → served as `/recommended-gear`
- `/blog/index.html` → served as `/blog/index`
- All remaining blog post pages (41 pages)

**Fix:** Strip `.html` from all canonical tags across all pages. This is a bulk find-and-replace across the codebase.

---

## 4. Duplicate Title Tags — HIGH ⚠

**23 duplicate title tags** found in the listing pages. These are caused by the same chain store (Staples, UPS Store, FedEx Office, etc.) appearing multiple times in the source CSV data with the same name and city — so the pre-generated pages end up with identical titles.

**Examples of duplicated titles:**
| Title | Duplicate IDs |
|---|---|
| Staples — 3D Printing in New York, NY | 624, 633, 650, 665, 736 |
| The UPS Store — 3D Printing in San Diego, CA | 474, 498, 513, 549, 550 |
| The UPS Store — 3D Printing in New York, NY | 649, 655, 667 |
| Staples — 3D Printing in Los Angeles, CA | 224, 252, 296 |
| FedEx Office Print & Ship Center — 3D Printing in New York, NY | 642, 666 |
| ARC Document Solutions — 3D Printing in San Diego, CA | 469, 555 |

**Fix options (in order of preference):**
1. **Deduplicate the source CSV** — remove duplicate business entries before regenerating data.
2. **Add address to title** — for listings that share a name+city, include the street address in the title to differentiate: `Staples (123 Broadway) — 3D Printing in New York, NY`.
3. **Apply noindex to duplicate IDs** — identify the lower-ID canonical entry per business name+city and noindex the duplicates.

---

## 5. Meta Descriptions — PASS ✅

All core and category pages have unique, descriptive meta descriptions within the 120–160 character range.

| Page | Description Length | Status |
|---|---|---|
| Homepage | 154 chars | ✅ |
| Directory | 146 chars | ✅ |
| FDM Printing | 146 chars | ✅ |
| SLA Resin | 160 chars | ✅ |
| SLS Nylon | 161 chars | ✅ |
| Metal Printing | 151 chars | ✅ |
| Technologies | 138 chars | ✅ |
| FAQ | 132 chars | ✅ |
| Listing pages | 150–162 chars | ✅ |

---

## 6. H1 Tags — WARNING ⚠

| Page | H1 | Status |
|---|---|---|
| index.html | "Find 3D Printing Services Near You" | ✅ |
| fdm-printing.html | "FDM 3D Printing Services" | ✅ |
| sla-resin.html | "SLA Resin 3D Printing Services" | ✅ |
| sls-nylon.html | "SLS Nylon 3D Printing Services" | ✅ |
| metal-printing.html | "Metal 3D Printing Services" | ✅ |
| technologies.html | "3D Printing Technologies Explained" | ✅ |
| faq.html | "Frequently Asked Questions" | ✅ |
| about.html | "About 3DPrintMap" | ✅ |
| recommended-gear.html | "Recommended 3D Printing Gear" | ✅ |
| **directory.html** | **MISSING** | ❌ |
| blog/index.html | "Guides, Tips & City Spotlights" | ✅ |
| listing pages | Business name (dynamic) | ✅ |

**Fix:** Add `<h1>Browse 3D Printing Services</h1>` to `directory.html`. Currently only rendered by JavaScript into `<div class="dir-results-header">`.

---

## 7. Title Tag Length — WARNING ⚠

Google truncates titles over ~60 characters in search results.

| Page | Length | Title |
|---|---|---|
| index.html | 47 ✅ | 3DPrintMap — Find 3D Printing Services Near You |
| directory.html | 40 ✅ | Browse 3D Printing Services — 3DPrintMap |
| fdm-printing.html | 46 ✅ | FDM 3D Printing Services Near You \| 3DPrintMap |
| sla-resin.html | 52 ✅ | SLA Resin 3D Printing Services Near You \| 3DPrintMap |
| technologies.html | 66 ⚠ | 3D Printing Technologies Guide — FDM, SLA, SLS, Metal \| 3DPrintMap |
| recommended-gear.html | 77 ⚠ | Recommended 3D Printing Gear — Printers, Filaments & Accessories \| 3DPrintMap |

**Suggested fixes:**
- `technologies.html`: `"3D Printing Technologies Guide | 3DPrintMap"` (43 chars)
- `recommended-gear.html`: `"3D Printing Gear Guide | 3DPrintMap"` (36 chars)

---

## 8. Structured Data (JSON-LD) — WARNING ⚠

JSON-LD is the primary signal used by AI citation engines (ChatGPT, Perplexity, Gemini) to understand and cite content authoritatively.

| Page | JSON-LD Present |
|---|---|
| index.html | ✅ WebSite + Organization |
| directory.html | ✅ CollectionPage + BreadcrumbList |
| fdm-printing.html | ✅ |
| technologies.html | ✅ |
| faq.html | ✅ FAQPage |
| listing pages | ✅ LocalBusiness + BreadcrumbList |
| **sla-resin.html** | ❌ Missing |
| **sls-nylon.html** | ❌ Missing |
| **metal-printing.html** | ❌ Missing |
| **about.html** | ❌ Missing |
| **blog/index.html** | ❌ Missing |
| **recommended-gear.html** | ❌ Missing |

**Fix:** Add an `ItemList` or `CollectionPage` JSON-LD block to the three technology pages, an `Organization` block to about.html, and a `Blog` schema to blog/index.html.

---

## 9. Open Graph & Twitter Cards — WARNING ⚠

Twitter card image (`twitter:image`) is missing on 6 pages. AI link-preview scrapers and social crawlers use this tag.

**Missing `twitter:image` on:**
- sla-resin.html
- sls-nylon.html
- metal-printing.html
- about.html
- blog/index.html
- recommended-gear.html

**Fix:** Add `<meta name="twitter:image" content="https://www.3dprintmap.com/og-default.png">` to these pages.

---

## 10. AI Citation Engine Readiness

AI engines (Perplexity, ChatGPT, Gemini) prioritize pages with:
- Unique, factual, first-party content ✅
- Structured data (JSON-LD) ⚠ — missing on 6 pages
- Clear author/publisher attribution (Organization schema) ⚠
- FAQ schema for Q&A content ✅ (faq.html has it)
- Canonical URLs that match served URLs ❌ — currently broken on 51 pages

**Recommendations for AI visibility:**
1. Fix the canonical mismatch (issue #3) — this is the highest priority
2. Add `Organization` JSON-LD with `sameAs` links to all pages (currently only on the homepage)
3. Consider adding an `ItemList` schema to the directory page listing top businesses
4. The blog city guides are strong candidates for AI citation — ensure each has `Article` schema (NYC, LA, Denver, Seattle posts already do; San Diego, SF, Atlanta posts need verification)

---

## Priority Fix List

| Priority | Issue | Effort |
|---|---|---|
| 🔴 1 | Canonical URLs — strip `.html` from 51 pages | Low (bulk script) |
| 🔴 2 | Duplicate listing titles — deduplicate CSV or add address to title | Medium |
| 🟡 3 | Add H1 to directory.html | Trivial |
| 🟡 4 | Add JSON-LD to sla-resin, sls-nylon, metal-printing, about, blog/index | Low |
| 🟡 5 | Add `twitter:image` to 6 pages | Trivial |
| 🟢 6 | Shorten titles on technologies.html and recommended-gear.html | Trivial |
| 🟢 7 | Verify new blog posts (San Diego, SF, Atlanta) have Article JSON-LD | Low |
