---
title: Lazy Loaded Syntax Highlighting on the Web
date: 2018-03-17
draft: true
---

Packing JavaScript into a website is easy. In this post, I want to do the opposite -
only load JavaScript as required so those pages that require specific functionality of a
particular JavaScript library don't impact the size and performance of other pages.

Originally, I developed this approach to avoid adding a syntax highlighting library to
all pages in my statically generated website. I wanted to add syntax highlighting to only
pages that have `<pre><code>...` elements.

The process for this approach is,

- once the DOM has loaded, check if `<pre><code>...` elements exist
- dynamically load the javascript code for the syntax highlighting library
- configure the syntax highlighting library and enable it on the page


## Checking we need syntax highlighting
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('pre code')) {
    console.debug('Preformatted code tag found. Loading highlight.js script')
    initSyntaxHighlighting();
  }
});
```

Notice the lack of jQuery!


## Dynamically loading JavaScript
```javascript
function initSyntaxHighlighting() {
  const HIGHLIGHT_JS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js";
  const HIGHLIGHT_CSS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github.min.css";

  const scriptEl = document.createElement('script');
  const styleEl = document.createElement('link');
  scriptEl.setAttribute('src', HIGHLIGHT_JS_SRC);
  styleEl.setAttribute('href', HIGHLIGHT_CSS_SRC);
  styleEl.setAttribute('rel', 'stylesheet');
  document.head.appendChild(scriptEl);
  document.head.appendChild(styleEl);

  console.debug('highlight.js script injected. Initilizing highlight.js');
  initHighlightJS(10);
}
```

This function create two DOM elements, a `script` to load the javascript for the
syntax highlighting library and a `link` to load the associated styling required by the
library.

The last `initHighlighingJS(10)` call will invoke the last function with an argument of
10. The 10 will be explained in the next section.


## Configuring the syntax highlighting library and enabling it
```javascript
function initHighlightJS(attempts) {
  function init() {
    console.debug(`Attempting to initialize highlight.js (attempts left: ${attempts})`);
    if (!window.hljs) return setTimeout(() => initHighlightJS(attempts - 1), 1000);

    console.debug('highlight.js loaded. Configuring highlight.js');
    for (const block of document.querySelectorAll('pre code')) {
      console.debug('Applying highlighting to:', block);
      const parentBlock = block.parentElement;
      const lang = block.classList[0]
      if (lang) {
        const highlighting = hljs.highlight(lang, block.innerText);
        block.innerHTML = highlighting.value;
        // Omitting 'hljs' class to avoid it overriding sites styles for pre/code tags
        parentBlock.className += `${lang}`;
      }
    }
  }

  if (attempts > 0) {
    init();
  } else {
    console.debug('Failed to initialize highlight.js');
  }
}
```

This function is actually composed to two parts: an internal `init` function and an `if`
block.

The `if` block is evaluated and run when the function is called and checked that the
number of attempts is greater than 0. Otherwise the function ends after logging to the
console a useful message.

The need for the `attempts` parameter arises from the fact
that the attempt to required data over the network may fail. To get around this, it is
necessary to check if the JavaScript we need has loaded yet. If it has not, we try again
if we have not tried more than the maximum number of attempts.

The inner `init` function is invoked a maximum of `attempt` times. It's responsible for
first checking whether the JavaScript has loaded (in this particular case,
[highlight.js](http://highlightjs.org/) is being used and we know the `hljs` should be
available as a global variable) and if it has not, then invoke the top level function
`initHighlightJS` after 1s to try again (note the `attempts - 1` to avoid infinite
recursion):

```javascript
if (!window.hljs) return setTimeout(() => initHighlightJS(attempts - 1), 1000);
```

If the `hljs` variable is defined, then all the code we need is now available and the
syntax highlighting can be enabled.

### Enabling syntax highlighting
The following is for my particular use case with requires extra work. For information
about using higlight.js in a straight forward and simple way consult the [highlight.js
usage documentation](https://highlightjs.org/usage/).

For my use case I wanted to use the ````language` syntax in my markdown templates for the
site to specify which language the code block is rather than letting highlight.js
automatically detect it.  This way it is possible to control whether syntax highlighting
should be applied to a particular block or not.

```javascript
for (const block of document.querySelectorAll('pre code')) {
  console.debug('Applying highlighting to:', block);
  const parentBlock = block.parentElement;
  const lang = block.classList[0]
  if (lang) {
    const highlighting = hljs.highlight(lang, block.innerText);
    block.innerHTML = highlighting.value;
    // Omitting 'hljs' class to avoid it overriding sites styles for pre/code tags
    parentBlock.className += `${lang}`;
  }
}
```

This code is iterating over each `<pre><code>...` block, checking which language the
block is specified with (the ````language` translates into `<code class="language">`),
and if a language is specified, then using the highlight.js API to generate HTML that
will replace the original HTML in the code block. Omitting 'hljs' is optional, but was
added here to avoid overriding the sites styling of the `<code>` block's background
color.


## _Copyright_

_This code listed on this page is licensed under the terms of the [MIT
license](/assets/text/mit-license)._
