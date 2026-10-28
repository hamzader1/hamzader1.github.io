---
title: "B-Trees from Scratch in Rust"
description: "How B-trees store sorted data on disk, why they beat binary search trees for databases, and a from-scratch Rust implementation."
pubDate: 2026-01-15
tags: [rust, data-structures, databases, btree]
author: "You"
---

A **B-tree** is the workhorse behind almost every database index and file system. Unlike a binary search tree, a B-tree node holds *many* keys and *many* children, which keeps the tree shallow and turns random disk access into sequential reads.

## Why not a BST?

A balanced BST has height $O(\log n)$, but with $n = 10^9$ that's ~30 levels. Each level may be a disk seek (~10ms on HDD). That's 300ms per lookup — unacceptable.

A B-tree of order $m$ has height

$$
h \approx \log_m n
$$

For $m = 100$ and $n = 10^9$: $h \approx 4.5$, i.e. ~5 disk reads. **Six times fewer.**

## Node layout

Each node stores up to $m-1$ keys and $m$ child pointers. Keys are sorted; a child between keys $k_i, k_{i+1}$ contains keys in $[k_i, k_{i+1})$.

```rust
#[derive(Debug)]
struct Node<K, V> {
    keys: Vec<K>,
    vals: Vec<V>,
    children: Vec<Box<Node<K, V>>>,
    leaf: bool,
}

impl<K: Ord, V> Node<K, V> {
    fn new(leaf: bool) -> Self {
        Self { keys: Vec::new(), vals: Vec::new(), children: Vec::new(), leaf }
    }
    fn is_full(&self, t: usize) -> bool {
        // t = minimum degree; max keys = 2t - 1
        self.keys.len() == 2 * t - 1
    }
}
```

## Splitting a full node

When inserting into a full node we split it in the middle, promoting the median key to the parent.

```rust
fn split_child(parent: &mut Node<K, V>, idx: usize, t: usize) {
    let mut full = std::mem::replace(&mut parent.children[idx], Box::new(Node::new(true)));
    // full has 2t-1 keys; split into two nodes of t-1 keys
    let mut right = Node::new(full.leaf);
    right.keys = full.keys.split_off(t);
    let median = full.keys.pop().unwrap();   // the t-th key (0-indexed: t-1)
    // move corresponding values/children...
    full.keys.truncate(t - 1);
    parent.keys.insert(idx, median);
    parent.children.insert(idx + 1, Box::new(right));
    parent.children[idx] = Box::new(full);
}
```

> Note: in production you'd move values and child pointers together; the above sketches the key bookkeeping.

## Search

```rust
fn search<K: Ord, V>(node: &Node<K, V>, key: &K) -> Option<&V> {
    let i = node.keys.binary_search(key).unwrap_or_else(|x| x);
    if i < node.keys.len() && node.keys[i] == *key {
        return Some(&node.vals[i]);
    }
    if node.leaf { return None; }
    search(&node.children[i], key)
}
```

Using `binary_search` keeps each node visit $O(\log m)$, but $m$ is small (hundreds), so the constant dominates.

## Complexity

| Operation | Time | Disk reads |
|-----------|------|------------|
| Search    | $O(\log n)$ | $O(\log_m n)$ |
| Insert    | $O(\log n)$ amortized | $O(\log_m n)$ |
| Delete    | $O(\log n)$ | $O(\log_m n)$ |
| Range scan| $O(\log n + k)$ | sequential |

## Rust-specific tips

- Use `Box<Node>` for recursive types (Rust needs sized types).
- Prefer `Vec` over linked lists; cache locality matters more than pointer chasing.
- For persistence, serialize nodes to fixed-size pages (4KB) and use an arena/pool allocator.
- `BTreeMap` in `std::collections` is a B-tree (not a red-black tree) — great for in-memory ordered maps.

## Further reading

- Comer, "Ubiquitous B-Tree" (1979).
- SQLite file format (btree.c).
- `std::collections::BTreeMap` source in rust-lang/rust.

