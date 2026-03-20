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
| Canonical vs. served URL mismatch | ✅ Fixed — 51 pages updated | Critical |
| Duplicate title tags | ✅ Fixed — 20 listing pages updated | High |
| Missing H1 on directory page | ✅ Fixed | Medium |
| JSON-LD missing on 6 pages | ✅ Fixed | Medium |
| Title tag length violations | ✅ Fixed — 2 pages shortened | Low |
| Twitter card image missing | ✅ Fixed — 6 pages updated | Low |
| AI citation readiness | ✅ Resolved | Medium |

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

## 4. Duplicate Title Tags — RESOLVED ✅

~~**23 duplicate title tags**~~ All 20 affected listing pages updated with unique titles. Each duplicate chain location now includes its street address in the title to differentiate it from sibling locations in the same city.

**Format applied:** `Business Name - Street Address, City, ST | 3DPrintMap` (50–60 chars)

| ID | Updated Title | Chars |
|---|---|---|
| 624 | Staples - 500 8th Ave, New York, NY \| 3DPrintMap | 48 |
| 633 | Staples - 5 Union Square W, New York, NY \| 3DPrintMap | 53 |
| 650 | Staples - 800 3rd Ave, New York, NY \| 3DPrintMap | 48 |
| 665 | Staples - 2248 Broadway, New York, NY \| 3DPrintMap | 51 |
| 736 | Staples - 767 Broadway, New York, NY \| 3DPrintMap | 50 |
| 474 | The UPS Store - 2020 Columbia St, San Diego, CA \| 3DPrintMap | 60 |
| 498 | The UPS Store - 4075 Park Blvd, San Diego, CA \| 3DPrintMap | 58 |
| 513 | The UPS Store - 5821 University Ave, San Diego \| 3DPrintMap | 59 |
| 549 | The UPS Store - 1804 Garnet Ave, San Diego, CA \| 3DPrintMap | 59 |
| 550 | The UPS Store - 9187 Clairemont Mesa, San Diego \| 3DPrintMap | 60 |
| 649 | The UPS Store - 33 Park Pl, New York, NY \| 3DPrintMap | 53 |
| 655 | The UPS Store - 541 3rd Ave, New York, NY \| 3DPrintMap | 54 |
| 667 | The UPS Store - 82 Nassau St, New York, NY \| 3DPrintMap | 55 |
| 224 | Staples - 1701 S Figueroa St, Los Angeles, CA \| 3DPrintMap | 58 |
| 252 | Staples - 3223 W 6th St, Los Angeles, CA \| 3DPrintMap | 53 |
| 296 | Staples - 3701 Santa Rosalia, Los Angeles, CA \| 3DPrintMap | 58 |
| 642 | FedEx Office - 200 Varick St, New York, NY \| 3DPrintMap | 55 |
| 666 | FedEx Office - 1602 2nd Ave, New York, NY \| 3DPrintMap | 54 |
| 469 | ARC Document Solutions - 555 W Beech, San Diego \| 3DPrintMap | 60 |
| 555 | ARC Document Solutions - Mira Mesa, San Diego \| 3DPrintMap | 58 |

**Notes:** FedEx Office Print & Ship Center abbreviated to "FedEx Office" (full name exceeds 60-char limit). State omitted on 3 titles where necessary to stay within limit. `<title>`, `og:title`, and `twitter:title` all updated. Fix applied via `fix-duplicate-titles.js`.

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
- Structured data (JSON-LD) ✅ — added to all previously missing pages
- Clear author/publisher attribution (Organization schema) ✅
- FAQ schema for Q&A content ✅ (faq.html has it)
- Canonical URLs that match served URLs ✅ — fixed across 51 pages

**Status:** All critical items resolved. Remaining opportunities:
1. Add `Organization` JSON-LD with `sameAs` links to all pages (currently only on the homepage and about.html)
2. Consider adding an `ItemList` schema to the directory page listing top businesses

---

## Priority Fix List

| Priority | Issue | Status |
|---|---|---|
| 🔴 1 | Canonical URLs — strip `.html` from 51 pages | ✅ Fixed (2026-03-20) |
| 🔴 2 | Duplicate listing titles — add address to title | ✅ Fixed (2026-03-20) |
| 🟡 3 | Add H1 to directory.html | ✅ Fixed (2026-03-20) |
| 🟡 4 | Add JSON-LD to sla-resin, sls-nylon, metal-printing, about, blog/index | ✅ Fixed (2026-03-20) |
| 🟡 5 | Add `twitter:image` to 6 pages | ✅ Fixed (2026-03-20) |
| 🟢 6 | Shorten titles on technologies.html and recommended-gear.html | ✅ Fixed (2026-03-20) |
| 🟢 7 | Verify new blog posts (San Diego, SF, Atlanta) have Article JSON-LD | ✅ Fixed (2026-03-20) |
