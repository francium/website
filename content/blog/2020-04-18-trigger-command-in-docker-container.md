---
title: "Trigger bash commands in a Docker container from host"
date: 2020-04-18T15:38:21-04:00
---

Here is an easy way to trigger a command inside a docker container. One use case
of this is to trigger a compiler, which is running inside a container, to
recompile sources.

Make sure `inotify-tools` is installed on the container, `apt install
inotify-tools` (Debian/Ubuntu), `pacman -S inotify-tools` (Arch). It's also
assumed some directory is mounted on the container which the host can write to
and container can read.

The trick here is a `.watchfile` file which we can `touch` which will be picked
up by [`watchdo`][1] (a script wrapping inotify written by [Denilson Sá][2])
which will trigger some commands.

**build.sh**,
```bash
while ./watchdo .watchfile; do
    gcc -o main main.c
done
```

Run `build.sh` inside the container and to trigger it just `touch` the
`.watchfile`. If your IDE or editor lets you map a shortcut to trigger a
command, you can easily trigger a recompilation without having to leave your
editor.

In Vim, you can map `<leader>s` to save and trigger recompilation,
```
:nmap <leader>s :wall <BAR> silent !touch .watchfile<CR>
```

Alternatively if you're working with a single file, you can just point `watchdo`
to the file and just saving normally after making changes it will be enough to
trigger the actions.

It's also possible to use inotify to watch a whole directory and trigger
whenever any file changes. `watchdo` currently doesn't support it, but it should
be a simple to add with some help from man pages or online references.


[1]: https://bitbucket.org/denilsonsa/small_scripts/src/default/sleep_until_modified.sh
[2]: https://bitbucket.org/denilsonsa/small_scripts/
