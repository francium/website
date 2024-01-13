---
title: Book Notes - Matthew Griffith, "Why Elm"
date: 2018-03-17
draft: true
---


- Elm incorporates some of the advances from the last 40 years of programming design
  without learning academic jargon
- Many pain points of frontend development don't exist in Elm - nulls, undefined is not a
  function - and runtime exceptions are extremely rare
- Static typing, compile time checks, friendly error messages, type signature inference
- Some experience Elm programmers will start a program by sketching out the type
  signatures first to get a high-level view of what the various APIs will be,
  organization will look like and create a specification for the code.
- Nulls are replaced by a Maybe type that provide safety without constant defensive
  programming
- Elm's typing provides many benefits to the developer,
    - No runtime exceptions in practice
    - Developer-friendly error messages at compile time
    - Make refactoring easy and robust since the compiler will walk you through
      everything that has been broken by your changes
        - No chance of forgetting to update some code in a corner of the codebase that
          would in other languages result in a runtime exception if left un-updated
    - Enforced semantic versioning since the compiler can know whether your changes add,
      remove or just modify existing code without API changes. This makes sure your
      changes do accidentally break your API for your users
    - In combination with Elm's immutable data, functions are easily reusable and
      testable
    - Optimization of external effects such as rendering and HTTP requests
- Elm's language level immutability provides ecosystem wide optimization and performance
  improvement opportunities - such as faster rendering without breaking existing code
- Elm's functions are pure and can't modify global state and can only create new data
- Side effects are managed by the Elm runtime and Elm code communicates with the runtime
  using language level features that help the developer describe what should happen and
  leave the work of making it happen to the runtime
- In comparison with JavaScript, immutability is hard to get right in JavaScript even
  with libraries such as Immutable.js. There is always caveats and special care that
  needs to be taken.
- Many of the optional, but recommended approaches to writing clean, maintainable code in
  JavaScript (as well as in JavaScript frameworks) require understanding, reading
  documentation and a lot of experience to apply correctly. Whereas in Elm, many of the
  ways to write clean and maintainable code are provided from the get go with no
  additional
  effort on the developers part
- Error handling in Elm is done in a way to ensure communication with the outside work
  can fail, but the Elm application will not throw a runtime exception. Effect managers,
  JSON decoders and ports will return data in a way that's correctly handled whether the
  task succeeded or failed
- Elm's types are designed so that all cases are handled - if they are not the compiler
  will tell you. This provided by language level feature such as the `case` statement and
  types like `Maybe` and `Result`
- TypeScript provides a superset of JavaScript that adds static typing and a Java-like
  OOP approach to programming
    - It adds some safety over vanilla JavaScript, but some things safety measures that
      compiler provides are left as optional configuration options rather than enabled by
      default
    - TypeScript also can't protect again runtime exception that may occur when the
      TypeScript compiled code interacts with the outside world or with other code in the
      same runtime environment
    - TypeScript's compiler warning also don't have the same developer-friendly error
      messages as Elm
    - TypeScript is also based on mutable data, so same care must be applied as with
      JavaScript programming
- Elm's feature also ensures that you can assume other developer's code follows the same
  good approaches to writing exception free, well structured and maintainable code as
  your own. Elm's semantic versioning also provides the previously mentioned benefit of
  guaranteeing the API doesn't break from under you without you knowing if you upgrade a
  package
- The Elm Architecture (TEA) provides a very maintainable variation of the
  Model-View-Controller pattern
    - TEA provides a declarative way of describing the application without worrying about
      the order of any particular bit of code
    - The view and controller are mapped to two Elm functions that are responsible for
      producing the HTML that will be rendered to the browser and updating the model when
      some message occurs
    - The update function provides a central source of change in the application and make
      it possible to easily debug changes in the application state. The update function
      additional has the benefit of being able to act as a state machine and tell you
      exactly what the next state will be given a model and a message
    - The view function will render out a set of HTML describing the view of the current
      application given a model. In addition, the HTML will be able to emit a message
      when the user performs some action that will then be handed to the update function
      by the Elm runtime
- Elm is similar to React, but Elm provides may of the optional things that can be
  combined with React (packages such as Redux, TypeScript support and libraries such as
  Immutable.js) already baked in to the language.
    - This reduces the amount of cognitive effort required to get started, make the right
      choices and choose the right packages and libraries that make the application easy
      to build and maintain
- Elm provides a set to tools and packages that may getting started approachable
    - elm-package provides access to a repository community built packages and libraries
      like NPM but no where as vast. The packages in the elm-package repository also all
      guarantee the same things as your own code. Note, as mentioned previously, semantic
      version is enforced on all Elm packages by default and the `elm-package diff`
      command will tell you exactly what has changed in your package
    - The Elm Debugger comes built in as of the 0.18 release. It provides a way to see
      messages that are being passed to the update function, as well as the state of the
      application (model) at any point in time. You can also export/import the
      application state to save the debug session for others (or yourself) to use for
      things such as bug reports
        - Unlike the Redux Debugger, Elm's debugger has access to the type information of
          the Elm code and can tell if you the imported debug history is comptabile with
          the current application code and not lead to bizarre side effects of
          incompatible code
    - elm-reactor provides a local sever that compiles Elm code on the fly, enables
      debugging by default and serves it for fast development
    - elm-format provides a way to automatically format Elm code that follows the best
      practices
    - elm-test takes advantage of what Elm provides to make unit testing fast and easy.
      It also provides fuzz testing
    - elm-css is a CSS preprocessor that takes advantage to Elm's typing to enforce type
      safety on CSS code to ensure it is error free and does what you expect. It can be
      used inline or as a separate stylesheet. Using elm-css, you can be sure that your
      styles will stay in sync with changes in your view thanks to the Elm compiler.
    - elm-style-animation provides an easy way to add animations to your application with
      all the guarentees of the Elm language
