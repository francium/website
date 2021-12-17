---
title: "The limits of TypeScript's Template Literal types"
date: 2021-12-16T12:00:00-04:00
summary: "How far can you push TypeScript's Template Literal types?"
---


<p class="info-box">
  🛈  The code was tested against TypeScript 4.5.4 only. Other versions may have
  different errors or behavior.
</p>

## Template Literal Types
Template literal types allow you to do things like,
```javascript
type World = "world";
type Greeting = `hello ${World}`;
```
Here `Greeting` is equivalent to the type `"hello world"`.

<p class="info-box">
  🛈  The <code>Range&lt;a, b&gt;</code> type being used below is from
  <a href="https://stackoverflow.com/a/70307091/2138219">Guillaume Mastio's Stackoverflow answer</a>.
</p>

You can also use union types in template literals, allowing you to succinctly
define huge unions,
```javascript
type YYYY = `20${Range<0, 10>}${Range<0, 10>}`;
```
Here `YYYY` is equivalent to the following union,
```
"2000" | "2001" | /* ... */ | "2098" | "2099"
```

And combinatorial explosions occur when you do something like,
```javascript
type YYYY = `20${Range<0, 10>}${Range<0, 10>}`
type MM = `0${Range<1, 10>}` | `${Range<11, 13>}`
type DD = `0${Range<1, 10>}` | `${Range<11, 32>}`
type IsoDate = `${YYYY}-${MM}-${DD}`
```
`IsoDate` is a huge union containing `100 * 12 * 31 = 37200` strings.


## Limits
We can start to see limits of the TypeScript type checker if we push things a
bit further.

First, consider a simple range of numbers,
```javascript
type T999 = Range<0, 999>
type T1000 = Range<0, 1000>
```
Here `T999` is a perfectly valid type. But `T1000` is invalid,
```
[tsserver 2589] [E] Type instantiation is excessively deep and possibly infinite.
```

So the limit for the recursively defined `Range` type is 1000.

If we look at the template literal type, we can see it hits a limit too,
```
type T316 = `${Range<0, 316>}-${Range<0, 316>}`
type T317 = `${Range<0, 316>}-${Range<0, 317>}`
```
Here `T316` (`316 === Math.foor(Math.sqrt(100_000))`) is a valid type with just
under 100k items. If we go above 100k with `T317`, we hit a limit,
```
[tsserver 2590] [E] Expression produces a union type that is too complex to represent.
```
