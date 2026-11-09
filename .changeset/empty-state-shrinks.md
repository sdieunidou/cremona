---
"@cremona/blocks": patch
"@cremona/stimulus": patch
---

Empty state: the illustration shrinks with a container narrower than 20rem instead of being cropped by the frame (`w-full max-w-80` replaces `w-80 shrink-0`), in React and in the Stimulus templates.
