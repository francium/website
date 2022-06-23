---
title: "Exception debugging or: How to abuse JavaScript exception and debug tests"
date: 2022-06-23T12:00:00-04:00
summary: "Exceptional abuse of exceptions"
---

You must've used print-debugging at some point?

What about exception-debugging?

I doubt I'm the first to think of it, but I'm not sure if I've even seen it
described or named anywhere.

## How it works
If I want to see if my test case reaches some point in my code or not and I'm
feeling particularly lazy -- just throw an exception:

```JavaScript
it('some test case', () => {
  const something = someFunction();
  expect(something).toBe(...);
});

function someFunction() {
  ...
  // does my test reach this point?
  throw Error('yes it does');
}
```

Which will tell you if the test case reached that point in the code or not. A
unique and easily recognizable exception message would be useful here.

## Where would this even be useful?
If some tool is hiding the regular output
text stream you could've used for print-debugging, you can use this technique
instead. It's a bit less useful, as it halts the execution or causes the code to
jump up to the nearest exception handler. Considering this second point, this
technique would also not be useful if you're applying it within some context
that is within an exception handler because we'd want to make sure the exception
is fatal.
