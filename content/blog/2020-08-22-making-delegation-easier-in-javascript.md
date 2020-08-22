---
title: "Making delegation easier in JavaScript (TypeScript)"
date: 2020-08-22T12:00:00-04:00
summary: "Using metaprogramming to enable easier method delegation"
---


Delegation is a means of code reuse without using inheritance. For more
information, have a look at [Wikipedia - Composition over
inheritance][wiki-c-o-i]; I will skip the *why delegation*, *why not
inheritance* discussion here.


## Manually setting up delegation

Consider this basic Printer and Scanner class example showing delegation in
action,
```ts
interface IPrinter {
  print(document: string): boolean;
}

interface IScanner {
  scan(): string;
}

class InkjetPrinter implements IPrinter {
  print(document: string): boolean {
    return true;
  }
}

class ColorScanner implements IScanner {
  scan(): string {
    return `scanned at ${new Date()}`;
  }
}

///////////////////////////////////////////////////////////////////////////////

class ZeroxModelOne implements IPrinter, IScanner {
  private _scanner: IScanner = new ColorScanner();
  private _printer: IPrinter = new InkjetPrinter();

  public scan(): string {
    return this._scanner.scan();
  }

  public print(document: string): boolean {
    return this._printer.print(document);
  }
}

///////////////////////////////////////////////////////////////////////////////

const p1 = new ZeroxModelOne();
console.log('p1 scan: ', p1.scan());
console.log('p1 print: ', p1.print('hello world'));
```

This outputs,
```
p1 scan:  scanned at Sat Aug 22 2020 13:36:28 GMT-0400 (Eastern Daylight Time)
p1 print:  true
```

Works as expected, but if we had to implement a whole bunch of methods that did
nothing more than call into some other method on one of the objects, it will get
verbose and tedious very quickly.


## Delegation helper: applying some metaprogramming to remove the boilerplate

We can use some JavaScript tricks to remove these dumb methods that do nothing
but call through,

```ts
type Ctor<T> = new(...args: any[]) => T;
type DelegateParams = {to: string, methods?: string[]}

function _delegate<T extends Ctor<any>>(base: T, params: DelegatParams): Ctor<any> {
  abstract class Clazz extends base {}

  params.methods?.forEach(method => {
    (Clazz.prototype as any)[method] = function(...args: unknown[]) {
      return this[params.to][method](...args);
    }
  });

  return Clazz;
}

function delegate(...targets: Array<DelegatParams>): any {
  return targets.reduceRight((prev, cur) => {
    return _delegate(prev, cur);
  }, Object as Ctor<any>);
}
```

All this is doing is monkey patching those call-through methods onto the class.
It'll make more sense when we see it in action,


## Easy delegation

```ts
const Delegators: Ctor<IPrinter> & Ctor<IScanner> = delegate(
  { to: '_printer', methods: ['print'] as Array<keyof IPrinter> },
  { to: '_scanner', methods: ['scan'] as Array<keyof IScanner> },
);

class ZeroxModelTwo extends Delegators {
  private _scanner: IScanner = new ColorScanner();
  private _printer: IPrinter = new InkjetPrinter();
}

const p2 = new ZeroxModelTwo();
console.log('p2 scan: ', p2.scan());
console.log('p2 print: ', p2.print('hello world'));
```

This too outputs the same stuff as first version,
```
p1 scan:  scanned at Sat Aug 22 2020 13:36:28 GMT-0400 (Eastern Daylight Time)
p1 print:  true
```

## Type checking

With TypeScript you do get a bit more type safety than JavaScript in this
context, but it's not bulletproof.

We can ensure the final class's interface looks correct by specifying the type
of `Delegators` using the TypeScript interaction type operator `&`,
```ts
const Delegators: Ctor<IPrinter> & Ctor<IScanner> = delegate(
```

This means any instance of `ZeroxModelTwo` class which extends `Delegators` will
show that it implements `IPrinter` and `IScanner`. Keeps the programmers, IDE and
compiler happy.

We're able to prevent mistakes from occurring in the `delegate` call, when
specifying the `methods` list using `keyof`,
```ts
{ ..., methods: ['print'] as Array<keyof IPrinter> },
```

This will catch any typos and ensure we only try to delegate to things that
exist on that interface. But unfortunately, in the current setup, this will only
check to see we've got all the methods required by the interface and any
additional methods will not be flagged by the compiler.

But I couldn't see a way to making the `to: '_scanner'` type safe since
we're trying to keep it private and the `Delegators` class would be inherited by
the class with the private property; Turns into a chicken and egg problem.

So obviously there's a bit of room from improvement here. Currently this is the
most type safe implementation I've thought of, but perhaps things will improve
in the future.

## Delegation of properties?

Delegating properties is certainly doable, using a [Proxy][mdn-proxy] would help a
lot, but without it things get a bit tricker. I wanted to achieve the method
delegation without a Proxy, so I didn't go down the Proxy route for enabling
property delegation.

Using Proxy to delegate the methods and properties is left as an exercise for
the reader.


## See also
- [property-tunnel](https://github.com/reasonink/property-tunnel)

[wiki-c-o-i]: https://en.wikipedia.org/wiki/Composition_over_inheritance
[mdn-proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
