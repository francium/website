---
title: "Mostly useful or: How I learned stop typing and write a few Bash aliases"
date: 2021-11-19T12:00:00-04:00
summary: "Featuring: quitting vim, theming apps, and fun pipes"
---


## The vim quitter

If you use vim, `:q`/`:wq` is perhaps muscle memory at this point. You can now
`:q`/`:wq` in bash too,
```bash
alias :q='exit'
alias :wq='exit'
```

I didn't actually write this one from scratch. I believe I came across it online
a few years ago.


## The GTK themer
I use the Adwaita dark theme on Gnome. But some applications have very poor dark
theme appearance, such as `gitg`. So I find myself opening them in light theme.
You typically do something like this to override the theme on a per application
basis,
```bash
GTK_THEME=Adwaita:light gitg &
```

But that's kinda hard to remember and I typically don't and instead rely on Bash
history search, `c-r`.

Instead, we can define,

```bash
alias gtk-light='GTK_THEME=Adwaita:light'
```

Now,
```
gtk-light gitg &
```
works as you'd expect and much easier to remember.


## The fun pipe


### Motivation
To explain this one, perhaps some motivating examples are necessary.

Suppose a file, `data.txt`, contains some file path in it,
```text
...
filepath = README.md
...
```

We can pull out `README.md` from this file using some basic tools,
```bash
$ grep "filepath =" data.txt | awk '{ print $3 }'
README.md
```

But we can't now open it in `vim` for example without having to do something
(inelegant) like,
```bash
$ vim $(grep "filepath =" data.txt | awk '{ print $3 }')
```

Now for something completely different. Consider functional languages, like
Haskell, Elm or F#, where we can do something like,
```elm
import Html exposing (text)
import Debug exposing (toString)

sum a b = a + b

double a = a * 2

main = sum 1 2 |> \a -> a * 3 |> toString |> text
```
This example is in Elm.  Here `main` outputs `"9"`.

Quite elegant and eliminates the amount of text manipulation we have
to do. Whereas in the bash example we had to wrap the `grep` and `awk` in a
subshell `$(...)`.


### Enter the fun-pipe (1)
```bash
grep "filepath =" data.txt | awk '{ print $3 }' |: vim _
```
Elegance.

The `_` stands in for the stdout of the precious stage of the pipeline.

Note that `|:` isn't actually a single 'operator'.
It's in fact the standard Bash pipe `|` and our new fun-pipe alias `:` without a space between.

We can define the fun-pipe as,
```bash
alias :='xargs -i_ --'
```


## Notes
(1): `fpipe` was the first name I thought of, but doing a quick search shows
there is actually already a `fpipe` project that does something somewhat similar
-- [alexmaco/fpipe](https://github.com/alexmaco/fpipe).
