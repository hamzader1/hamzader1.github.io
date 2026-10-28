---
title: "Cache-Friendly Data Structures in Rust"
description: "AoS vs SoA, cache lines, prefetching, and how to make your Rust code 10x faster without changing the algorithm."
pubDate: 2026-02-20
tags: [rust, performance, cache, memory]
author: "You"
---

CPUs are fast; memory is slow. A cache miss costs ~100 cycles. The fix is usually **layout**, not algorithm.

## Array of Structs vs Struct of Arrays

```rust
// AoS: good for "process one entity fully"
struct Particle { x: f32, y: f32, z: f32, vx: f32, vy: f32, vz: f32 }
let particles: Vec<Particle>;

// SoA: good for "process one field across all entities"
struct Particles {
    x: Vec<f32>, y: Vec<f32>, z: Vec<f32>,
    vx: Vec<f32>, vy: Vec<f32>, vz: Vec<f32>,
}
```

If you only need positions, SoA loads 3 floats per cache line instead of 6. ~2x bandwidth.

## Cache line = 64 bytes

A `Vec<u8>` of 64 elements fits one line. A `Vec<i64>` of 8 fits one line. Align hot structs:

```rust
#[repr(align(64))]
struct HotCounter { value: AtomicU64 }
```

Avoid **false sharing**: two threads writing adjacent fields in the same cache line cause cache-line bouncing. Pad or align.

## Prefetching

```rust
// manual prefetch (nightly / intrinsics)
use std::intrinsics::prefetch_read_data;
unsafe { prefetch_read_data(ptr, 3); }
```

Usually the hardware prefetcher handles sequential access. Help it by keeping access patterns linear.

## Branch prediction

Sort data so branches are predictable, or use branchless code:

```rust
// branchy
if x > 0 { a += x } else { a -= x }
// branchless
a += x.abs();
```

## Measuring cache behavior

```bash
perf stat -e L1-dcache-load-misses,LLC-load-misses ./target/release/bin
```

Or `cachegrind` via `valgrind --tool=cachegrind`.

## Checklist

- [ ] Profile first
- [ ] Prefer `Vec` over `LinkedList`
- [ ] SoA for columnar workloads
- [ ] Align hot atomics to 64 bytes
- [ ] Avoid `clone` in inner loops
- [ ] Use `#[repr(C)]` for FFI / predictable layout

