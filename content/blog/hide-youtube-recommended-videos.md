---
title: Hide YouTube's "Recommended For You" suggestions
date: 2018-10-06T19:43:00-04:00
---
One thing I find quite annoying with YouTube is "Recommended For You" spam in the related
videos section. I do not sign into YouTube and use [Firefox
Containers](https://support.mozilla.org/en-US/kb/containers) so most "Recommended For You"
videos are irrelevant, distracting, and seem suspiciously like they've been paid for (I
don't know if this is true).

As a user of [uBlock Origin](https://github.com/gorhill/uBlock), I do have the ability to
add custom filters to block DOM elements. After fiddling around with things and searching
the web[1], I managed to come up with this filter which gets rid of "Recommended For You"
from the related videos list,

```
youtube.com###css selector:has-text(Recommended for you)
```

You can put this line in "My filters" (on uBlock's setting page).

### References

- [1] Cosmetic filters.
<https://github.com/gorhill/uBlock/wiki/Static-filter-syntax#cosmetic-filters>
