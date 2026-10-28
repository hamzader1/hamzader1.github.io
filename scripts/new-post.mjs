import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new "Post title"');
  process.exit(1);
}
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const date = new Date().toISOString().slice(0, 10);
const file = join('src/content/posts', `${slug}.md`);
if (existsSync(file)) { console.error('Already exists:', file); process.exit(1); }
const template = `---
title: "${title}"
description: "One-line summary of the post."
pubDate: ${date}
tags: [rust, systems]
draft: true
author: "You"
---

Write your post here.

## Section

\`\`\`rust
fn main() {
    println!("hello");
}
\`\`\`

Inline math: $O(n \\log n)$. Block math:

$$
T(n) = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$
`;
writeFileSync(file, template);
console.log('Created', file);
console.log('Set draft: false when ready to publish.');
