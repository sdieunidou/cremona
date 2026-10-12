---
"@cremona/tokens": patch
---

`css/tailwind.css` no longer names imports in its header comment: Symfony AssetMapper reads imports inside comments and failed to download `tailwindcss` relative to the package.
