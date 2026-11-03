# Commands cheat sheet

## Writing posts

```bash
npm run new "Post Title"     # creates src/content/posts/post-title.md (draft)
```

Edit the file, then set `draft: false` to publish.

## Preview locally

```bash
npm run dev                  # http://localhost:4321
```

## Publish

```bash
npm run build                # builds into docs/
git add . && git commit -m "new post" && git push
```

GitHub Pages serves `docs/` automatically. Site: https://hamzader1.github.io/

## Useful

```bash
npm run build                # rebuild site
npm run preview              # preview the build
```

## Post frontmatter

```yaml
---
title: "My Post"
description: "Short summary"
pubDate: 2026-01-01
tags: [rust, systems]
draft: false
---
```

## Markdown features

- Code blocks: ` ```rust ` (highlighted, line numbers)
- Inline math: `$O(n)$`
- Block math: `$$ ... $$`
- Section break: `---` (renders ❧)
