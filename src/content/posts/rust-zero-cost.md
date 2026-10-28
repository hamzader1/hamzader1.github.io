---
title: "Zero-Cost Abstractions in Rust: What the Compiler Actually Does"
description: "Traits, generics and iterators compile down to the same code you'd write by hand. Here's how to verify it with cargo-asm and perf."
pubDate: 2026-02-02
tags: [rust, performance, optimization, llvm]
author: "You"
---

"Zero-cost abstraction" is Rust's promise: you don't pay for what you don't use, and what you do use is as fast as hand-written code. Let's test that claim.

## Iterators vs loops

```rust
let sum: i64 = (0..1_000_000).filter(|x| x % 2 == 0).map(|x| x * x).sum();
```

vs

```rust
let mut sum = 0i64;
for x in 0..1_000_000 {
    if x % 2 == 0 { sum += x * x; }
}
```

With `cargo rustc --release -- --emit=asm` (or `cargo-asm`), both produce essentially identical LLVM IR and final assembly. The iterator chain is inlined and fused into a single loop.

## Generics and monomorphization

Generic functions are compiled once per concrete type:

```rust
fn max<T: Ord>(a: T, b: T) -> T { if a > b { a } else { b } }
```

`max::<i32>` and `max::<f64>` become two separate functions. No vtable, no boxing. Cost: larger binary, longer compile. Benefit: full inlining and specialization.

## When abstractions *do* cost

- **`dyn Trait`** (trait objects) use dynamic dispatch (vtable). Use when you need heterogeneous collections.
- **`Box<dyn Trait>`** adds a heap allocation.
- **`Rc`/`Arc`** add reference counting overhead.
- **Bounds checks** on slices (`slice[i]`) — use `.get(i)` or iterators, or `unsafe` with `get_unchecked` after proving safety.

## Measuring

```bash
cargo build --release
perf stat -e cache-misses,branch-misses ./target/release/mybin
```

Or use `criterion` for micro-benchmarks:

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};
fn bench(c: &mut Criterion) {
    c.bench_function("sum squares", |b| b.iter(|| black_box((0..1000).filter(|x| x%2==0).map(|x|x*x).sum::<i64>())));
}
criterion_group!(benches, bench);
criterion_main!(benches);
```

## Tips

1. Profile before optimizing (`cargo flamegraph`).
2. Prefer iterators — they compose and optimize well.
3. Avoid `clone()` in hot loops; borrow or move.
4. Use `#[inline]` sparingly; trust the optimizer.
5. Check `#[cold]` / `#[likely]` hints (nightly) for branch prediction.

## Summary

Zero-cost doesn't mean zero *compile* cost or zero *binary* cost. It means no runtime overhead vs the best hand-written equivalent. Measure to confirm.

