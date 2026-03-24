# Image Guide — 3DPrintMap

Always use WebP with a fallback. Never use a bare `<img src="*.jpg">`.

---

## 1. Convert images to WebP

Install `cwebp` (once): https://developers.google.com/speed/webp/download

```bash
# Single file
cwebp -q 82 my-photo.jpg -o my-photo.webp

# Bulk convert all JPGs in a folder
for f in public/images/*.jpg; do cwebp -q 82 "$f" -o "${f%.jpg}.webp"; done

# Bulk convert PNGs
for f in public/images/*.png; do cwebp -q 82 "$f" -o "${f%.png}.webp"; done
```

Quality `-q 82` is the sweet spot: visually lossless, ~70% smaller than JPEG.
Keep the original `.jpg`/`.png` as fallback for older browsers.

---

## 2. HTML pattern — `<picture>` with WebP source

```html
<picture>
  <source srcset="/images/my-photo.webp" type="image/webp">
  <img src="/images/my-photo.jpg"
       alt="Describe the image clearly"
       width="800" height="450"
       class="lp-img"
       loading="lazy"
       decoding="async">
</picture>
```

**Rules:**
- Always set `width` + `height` — prevents layout shift (CLS).
- Use `loading="lazy"` for below-the-fold images.
- Use `loading="eager"` for the first/hero image on a page (above the fold).
- Always write a descriptive `alt` text.

---

## 3. In generate-listings.js

Use the built-in `pictureImg()` helper:

```js
// Below-the-fold image (lazy loaded by default)
pictureImg({ src: '/images/shop-interior.jpg', alt: 'Shop interior', width: 800, height: 450 })

// Hero image — above the fold, load eagerly
pictureImg({ src: '/images/hero.jpg', alt: 'Hero', width: 1200, height: 500, lazy: false, cls: 'lp-img-hero' })

// Thumbnail
pictureImg({ src: '/images/thumb.jpg', alt: 'Thumbnail', width: 80, height: 80, cls: 'lp-img-thumb' })
```

The helper automatically substitutes `.webp` for the `<source>` srcset.

---

## 4. CSS classes (defined in main.css)

| Class | Use case |
|---|---|
| `.lp-img` | Default — responsive, full width, `object-fit: cover` |
| `.lp-img-hero` | Full-width hero, max-height 360px |
| `.lp-img-thumb` | 80×80 square thumbnail |
| `.blog-img` | Same as `.lp-img`, alias for blog posts |
| `.site-img` | Same as `.lp-img`, generic alias |

---

## 5. Where to store images

```
public/
  images/
    listings/   ← business photos (named by business ID, e.g. 42.jpg + 42.webp)
    blog/       ← blog post images
    general/    ← homepage / misc site images
```
