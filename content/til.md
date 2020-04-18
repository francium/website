---
title: Today I Learned
hidden: true
omitDate: true
---
<!-- hidden: prevent hugo from adding this as a blog article -->
<!-- omitDate: don't show a date -->


## 2020-04-17 -- Vim: Silencing the output of a shell command
```
:nmap <leader>x :silent !some-command<CR>
```

:vim:


## 2020-04-17 -- Vim: Mapping multiple commands to a single key mapping
```
:nmap <leader>x :command-1 <BAR> command-2<CR>
```

:vim:
