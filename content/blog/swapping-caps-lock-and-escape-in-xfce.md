---
title: Swapping Caps Lock and Escape in Xfce
date: 2018-05-12
draft: true
---

Xfce requires extra work to make Caps Lock function as Escape and Escape function as Caps
Lock. After various attempts using `xmodmap` in combination with Xfce autostart
application option and editing `/etc/X11/xorg.d/`, I wasn't able to get something that
worked consistently, persisted across reboots and didn't revert my config randomly after
a few minutes, a few hours or after suspending.

It appears that Xfce will overwrite the custom Xkb options. A user on freenode, djmock,
provided the answer to this problem.

Open the Xfce Settings Editor, go to the 'keyboard-layout' channel and add a new entry,

- Property: `/Default/XkbOptions/SwapCapsEscape`
- Type: `String`
- Value: `caps:swapscape`

![](/assets/img/content/swapping-caps-lock-and-escape-in-xfce.jpg)

Now the config should persist without issue next reboot. To apply this config right away
run `setxkbmap -option caps:swapescape` in the shell.

## Update

Turns out while this methods is a lot more reliable in general, it my system still
reverts Caps Lock and Escape after suspending most of the time. I've assigned a keyboard
shortcuts to trigger the `setxkbmap` command manually when that happens.
