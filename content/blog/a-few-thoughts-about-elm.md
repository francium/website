---
title: "A Few Thoughts About Elm"
date: 2019-06-03T17:18:53-04:00
---

*Note: This is fairly rough right now. I may come back and revised in the future.*

This will not be an introduction to Elm. If you do not know what Elm is, have a look at
the [wikipedia article](https://en.wikipedia.org/wiki/Elm_(programming_language)) about
Elm and the [Elm website](https://elm-lang.org/).

Prior to learning Elm, I did not know anything about functional programming aside from
`map` and some vague understand of `reduce`. Of course, functional programming is a lot
more than just `map` and `reduce`. Elm is also more than just another functional
programming language. The goal of Elm, from what I understand, is to provide a robust
platform for writing robust web application in the face of churn and chaos in the rest of
the JavaScript ecosystem. Elm also acts as a gateway to the world of functional
programming for developers of all skill levels.

As a platform for web development, it exhibits many great qualities. Having worked on
various small projects in Elm, I was able get something on screen quickly and easily. The
compiler is also quite the experience. It's not like any compiler I've used since -- I
know rust, for example, has a pretty cool and helpful compiler, but I haven't begun that
journey of learning yet but I do look forward to diving in soon.

Going back to vanilla JavaScript is quite a shock once you experience the power of
compiler that can help you avoid very common mistakes and provide you with useful hints.
There's no 'AI' behind the compiler, just decades of programming language, compiler design
and theory[1].

Even after doing some extensive TypeScript development, it's not quite the same
experience. When configuring TypeScript, I opted to enabled the strongest typing options
possible and utilize the type system as much as possible. It's was a decision heavily
influenced by my Elm development experience. The compiler did obviously help countless
times by catching common type level issues and enable myself and other developers to
easily refactor code, add new code and remove code with a lot more confidence.

I think the difference between Elm and TypeScript, from  a development experience
perspective, is the fact the Elm is more than just a language. It's a domain-specific
language and framework. It not only compiles highly abstract functional programming
concepts into vanilla JavaScript, it also provide a robust framework for architecting in
the web application according to a certain set of principles. This two fold nature of Elm,
bundled into a single entity, means Elm has a better idea of what you're trying to do and
can guide you along the way better than a general purpose language like TypeScript can.

Like most things in engineering, it's a trade off. Neither language is better in some
general sense, both have different goals and different aspirations. With both do manage to
do is make web application development more approachable. JavaScript can do a lot of
things, but it's quite easy to shoot yourself when you start doing a lot in just
JavaScript. There's a weak type system, the language is flexible and dynamic. But the
power of JavaScript means if you don't really understand it or don't manage to keep all
the code in your head, which gets harder and harder once you write more and more code,
you're bound to make a mistake or introduce a bug. This is not a slight at JavaScript,
it's fine as a language, but it's not great. I think TypeScript and Elm provide some great
developer experiences and empower the developer more than vanilla JavaScript.

Elm's very domain specific approach also enabled additional benefits for the developer.
One of the great things about the Elm ecosystem is the confidence it provide the developer
with things like automatic semantic versioning -- compiler tells you if you're breaking a
public API. With the 0.19 update, Elm also prohibits any vanilla JavaScript to be included
in public Elm modules, Prior to this update, you were able to sneak in unsafe JavaScript
code through native modules. While it was a very controversial choice, it makes sense
based on what the language is trying to do. The goal of Elm is to make the life of
developers easier. Having a compiler that can provide you with guarantees is a valuable
thing. By adding in unsafe JavaScript, you're undermining the compiler's abilities. Again,
trade off. But a trade off that is made to enhance confidence for developers and allow
them to reason about code without additional mental overhead that where possible.

I founded a lot of value from learning Elm and developing some small projects in it. It's
a different experience. It's not always going to be the right tool for every job. It's
important to be able to choose the right tool. Learning Elm required some amount of
dedication. There are no familiar classes and you're in a whole new paradigm. But the
dedication is worth it because you're be exposed to a new way to think about problems.
You're see that it's possible to take a set of functions that to do something and compose
them in many different ways. I really find my self wishing there was a builtin pipe
operator in more languages. You will also have a greater appreciation for types and will
miss some of the first class type features Elm provides. Pattern matching is also another
thing I wish I could do in other languages.

But  moving away from just the syntax, Elm's approach to architecting application has been
very influential. By making use of types, you gain the ability to reason about application
state, design functionality without breaking other things and know when (and how) to fix
other things when you do break something during a refactor or feature addition (or
deletion).

While I was working on a final year project, I opted to employ many of the lessons I
learned from Elm. This project was in TypeScript and used an Elm-like JavaScript framework
called Hyperapp. Of course enabling the strictest and strongest type checking options in
TypeScript was one of the things I did. And it was a pain fixing some of the type issues
and getting some vanilla JavaScript libraries/frameworks to play nice. But it allowed us
to code with confidence, break things less often and allowed us to easily find and fix
breaks. Elm's architecture also provided the necessary background on how to approach
managing complex application state (it's basically what Redux does if you have experience
with Redux). Having experienced this type of approach to web development was highly
valuable. But there bigger take away is that it's important to explore new things and
learn the different approaches to doing the same things. Eye opening experiences are
everywhere and it's worth it to at least give them a glance.

---

[1] https://guide.elm-lang.org/
