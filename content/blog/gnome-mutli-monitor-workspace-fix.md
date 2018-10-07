---
title: "GNOME Mutli-Monitor Workspace Fix (Gnome 3.30)"
date: 2018-10-06T20:18:48-04:00
---

`workspaces_only_on_primary` setting is suppose to make workspaces work correctly [1] in a
multi-monitor setup.

There are older articles on the internet about enabling this option, but they won't work
with newer versions of GNOME. Prior to 3.30, I was using a very similar command which was
described by [Greg Cordts in his post on the
subject](http://gregcor.com/2011/05/07/fix-dual-monitors-in-gnome-3-aka-my-workspaces-are-broken/).

After upgrading to GNOME 3.30, this way of enabling the option stopped working.
After [reporting this to the GNOME team as a bug](http://gregcor.com/2011/05/07/fix-dual-monitors-in-gnome-3-aka-my-workspaces-are-broken/), two individuals provided some very useful
information,

- The new way of enabling this option is,
  ```
  gsettings set org.gnome.mutter workspaces-only-on-primary false
  ```

- The Gnome Tweaks tool provides an option to enable this in the Workspaces tab

---

[1] Correctly means the workspace extends across all monitors and changing workspace
changes to the same workspace on all monitors. I don't know why this is not enabled by
default.
