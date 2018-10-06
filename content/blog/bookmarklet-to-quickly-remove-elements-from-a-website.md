---
title: Bookmarklet to quickly remove elements From a website
date: 2018-05-27
draft: true
---

For the most part, the war on popups has been won -- or it appears that way at first
glance. Most mainstream websites won't attempt to open crap in popups. No, now they've
opted to instead inline or overlay crap on top of any useful or interesting content they
may still be serving.

I'm of course referring to modals popups. Which are probably as useful as *clippy* ever
was. But equally as -- no, definitely more -- annoying.

Of course you can use a decent adblocker like [uBlock
Origin](https://github.com/gorhill/uBlock) to block out these annoyances for good, but it
takes a bit of time and perhaps you don't want to give this website anymore time that it
deserves. For any website you frequent regularly, you should definitely check out [how to
block annoyances using uBlock
Origin](https://github.com/gorhill/uBlock/wiki/Element-picker). Additionally, I also
recommend taking a look at the [Kill Sticky
Bookmarklet](https://alisdair.mcdiarmid.org/kill-sticky-headers/).

I've hacked together this bit of *useful* JavaScript to make it possible to remove crap in
a total of two click (assuming you're bookmark bar is visible).

### Bookmarklet that removes the next thing you click on a page: <a href="javascript:(function()%7Bconst%20eventHandler%20%3D%20function(event)%20%7Bevent.target.parentElement.removeChild(event.target)%3Bdocument.removeEventListener('click'%2C%20eventHandler)%3Bdocument.body.style.cursor%20%3D%20orgCursor%20%7C%7C%20%22%22%3B%7D%3Bconst%20orgCursor%20%3D%20document.body.cursor%3Bdocument.body.style.cursor%20%3D%20'crosshair'%3Bdocument.addEventListener('click'%2C%20eventHandler)%7D)()"> Remove that!  </a>

Bookmark this link or drag it to your browser's bookmarks bar.

<div class="warning">
Links will still get triggered if you click on them. Make sure you click
whitespace to avoid following any links.
</div>

## Source

### Original
```javascript
const eventHandler = function(event) {
  event.target.parentElement.removeChild(event.target);
  document.removeEventListener('click', eventHandler);
  document.body.style.cursor = orgCursor || "";
};
const orgCursor = document.body.cursor;
document.body.style.cursor = 'crosshair';
document.addEventListener('click', eventHandler);
```

### Bookmarklet minified format
```javascript
javascript:(function()%7Bconst%20eventHandler%20%3D%20function(event)%20%7Bevent.target.parentElement.removeChild(event.target)%3Bdocument.removeEventListener('click'%2C%20eventHandler)%3Bdocument.body.style.cursor%20%3D%20orgCursor%20%7C%7C%20%22%22%3B%7D%3Bconst%20orgCursor%20%3D%20document.body.cursor%3Bdocument.body.style.cursor%20%3D%20'crosshair'%3Bdocument.addEventListener('click'%2C%20eventHandler)%7D)()
```
