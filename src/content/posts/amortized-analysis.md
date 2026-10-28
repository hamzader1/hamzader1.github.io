---
title: "Amortized Analysis: Why Vec::push is O(1)"
description: "Aggregate, accounting, and potential methods explained with Rust's Vec growth strategy."
pubDate: 2026-03-05
tags: [rust, algorithms, complexity, math]
author: "You"
---

`Vec::push` is $O(1)$ *amortized*, even though occasionally it's $O(n)$ (when reallocating). How?

## The growth strategy

Rust's `Vec` doubles capacity when full. Pushing $n$ elements costs:

$$
T(n) = n + \frac{n}{2} + \frac{n}{4} + \cdots + 1 = 2n = O(n)
$$

So average per push = $O(1)$.

## Three methods

### 1. Aggregate

Total cost over $n$ ops $\le cn$, so amortized $= c$.

### 2. Accounting

Charge each push $3$ credits: $1$ for the push, $2$ saved for future copy. When resize happens, saved credits pay for moving. Balance never negative.

### 3. Potential

Define potential $\Phi(D) = 2 \cdot \text{size} - \text{capacity}$ (or similar). Amortized cost $= \text{actual} + \Delta\Phi$. Resizes have $\Delta\Phi$ negative enough to cancel.

## Generalizing

Any structure that grows geometrically (factor $>1$) has $O(1)$ amortized append. Hash maps, dynamic arrays, rope buffers all rely on this.

## Caveat

Amortized bounds assume you keep the structure alive. If you `push` then immediately `drop`, you paid $O(n)$ for nothing — but that's fine, total work still $O(n)$.

## Rust note

`Vec::with_capacity(n)` avoids all reallocations if you know the size. Use it in hot paths:

```rust
let mut v = Vec::with_capacity(1024);
for i in 0..1024 { v.push(i); } // zero reallocs
```

