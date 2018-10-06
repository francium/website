---
title: Maybes, Pipes and Results with Typescript
date: 2018-05-29
draft: true
---

A `Maybe` is a way to wrap a possible `null` in a container. The container makes it
possible to easily pass this possibly `null` value around without running into issues
that arise typically, such as *undefined is not a function* or *can not read x of
undefind*.

Let's define a `Maybe` type and see how we can use it.

``` typescript
type Maybe<T>
  = Just<T>
  | Nothing;
```

We're using the `type` operator to define a generic union type. There are two possible
types in this union: `Just` represents some value of type `T` and `Nothing` which
represents a `null` value.

Notice how we didn't use `null` anywhere in the definition. We're instead using the
`Nothing` to stand in it's place.

The `Just` and `Nothing` types can be defined as simple classes,

``` typescript
class Just<T> { public constructor(public readonly value) {} }

class Nothing {}
```

Now we can create `Maybe` values and use them,

``` typescript
const maybeA: Maybe<number> = new Just<number>(55);
const maybeB: Maybe<number> = new Nothing<();
```

Notice that we need to declare `maybeA` and `maybeB` as values of type `Maybe<number>`
else the compiler will treat them of type `Just<number>` and `Nothing` respectively.

``` typescript
function matchAMaybeNumber(maybe: Maybe<number>): void {
  switch (maybe.constructor) {
    case Just:
      console.log('It is just a number,', (maybe as Just).value);
      break;

    case Nothing:
      console.log('It does not have a value');
      break;
  }
}
```

``` javascript
>> matchAMaybeNumber(maybeA);
  It is just a number, 55
>> matchAMaybeNumber(maybeB);
  It does not have a value
```

By using the explicit pattern matching over returning the raw value and manually checking
if it is not `null` or not `undefined`, we ensure we don't accidentally ever run into the
issue of misusing the value based on incorrect assumptions or misunderstanding what a
given program is doing.

---

Let's attempt to convey this in a more practical example.

Suppose we're making a map application that uses an online API to get map data and stores
the user's last position on the map in LocalStorage. To avoid ever writing code that
could potentially assume, incorrectly, that the value is always defined. LocalStorage is
persistent across sessions and normally would not be deleted except in certain
circumstances. The W3C draft states,

> User agents should expire data from the local storage areas only for security reasons
> or when requested to do so by the user. User agents should always avoid deleting data
> while a script that could access that data is running.

So in both theory and practice, it is possible for our value to no longer be in
LocalStorage either because the browser decided to delete it or the user manually cleared
the browser's data. This seems like a great thing to wrap in a `Maybe` so we don't end up
with numerous `null`/`undefined` checks further on or accidentally use the value causing
exceptions or bizarre JavaScript *black magic* behavior.

``` typescript
interface Coordinates { 
  long: number; 
  lat: number;
}

function getLastLocation(): Maybe<Coordinates> {
  // Query LocalStorage
  const value = ...

  if (value === null) return new Nothing();

  return new Just<Coordinates>(JSON.parse(value));
}
```

Whenever any part of our application tried to get the last location, it can not misuse the
value by assuming it to always be defined and it nor is forgetting a null check an issue
-- the value must always be safely unwrapped by checking the `Maybe`'s type.

There is a more general pattern here. In functional programming this sort of thing is
very common. Is the *monad* design pattern. By creating a monad we're able to define a
data type and specify what operations are possible to perform on this data type. The
`Maybe` is a very simple example of this. To keep things simple for now, we only looked
at how to define and use the Maybe, but the are ways in which we can create a set of
functions that accept a `Maybe`, perform operations and can be composed together to
create pipelines that can operate without excessive null checks or run into issues of
accidentally forgetting to make sure our values are defined.
