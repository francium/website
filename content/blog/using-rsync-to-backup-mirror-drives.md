---
title: Using Rsync to efficiently backup (mirror) hard drives
date: 2017-12-26
---

<div class="info">
  The concepts discussed here are not Raspberry Pi specific and can easily be adapted for
  other uses.
</div>


## Background


I have a Raspberry Pi setup with an external hard drive that is accessible over Samba.
It's be quite reliable so far, but I wanted to backup the data to another external drive
hooked up to the same Raspberry Pi.

I found a simple solution to this problem using Rsync and Systemd timers (as opposed to
installing Cron and learning Cron, but if you wish, you can substitute Systemd with
Cron).


## Setup

My preconditions were: 2 external hard drives, `systemd` and `rsync`.

There is a master drive and a slave drive (one that is a mirrored backup of the master).
Only the master is accessible over samba and the slave is not exposed except by ssh-ing
into the Pi itself.

I've labeled the two disks so I can identify them by looking at `/dev/disk/by-label/`.
The labeling can be done when you format them and create a filesystem or using the
`e2label` command as described in [this nixCraft article][nixCraft1].

So ensure the two disks are automatically mounted in a known location, I've added these
two lines to my `/etc/fstab` config:

    # <file system>  <dir>  <type>  <options>  <dump>  <pass>
    ...
    /dev/disk/by-label/Master  /media/user_name/Master  ext4  defaults  0  0
    /dev/disk/by-label/Slave  /media/user_name/Slave  ext4  defaults  0  0

Make sure the mounting directory exists beforehand. As you can see above, I've chosen
`/media/user_name/` and created two directory in there `Master` and `Slave`.

Systemd timers are composed of two files, a service for performing some task, and a timer
for specifying when the service should execute. The service file will point to a bash
script that will call rsync to perform the actual task of mirroring the two drives.

### Mirroring Script

I've saved this file as `/usr/local/bin/drive-mirroring`:

```bash
#!/bin/bash

echo "########### Drive mirroring starting at `date` ###########"

SOURCE=/media/user_name/Master/
DEST=/media/user_name/Slave/mirror

rsync -ahvAE --delete --stats $SOURCE $DEST 2>&1 | tee /var/log/drive-mirroring.log

echo "########### Drive mirroring completed at `date` ###########"
```

Note that we've used the `tee` command to pipe the output (stdout and stderr as per the
`2>&1`) of rsync to two places -- stdout and the file `/var/log/drive-mirroring.log`. The
stdout in the context of this setup will be systemd's journal (systemd's logs) since
we'll be calling this bash script from within a systemd service.

Also note that the file we're outputting to will be overwritten each time this script is
run so it will only contain output from the previous execution. This behavior can be
adjusted to suit your needs, but systemd's journal will have a complete set of logs
anyway.

In the script, I've specified some arguments to customize the behavior of rsync. Here is
a brief description and reason for each option:

- `a` -- Archive move; ensure common metadata is copied over
- `h` -- Human readable numbers are output instead of bytes
- `v` -- Increase verbosity of the output
- `A` -- Preserve ACLs; also implies `p` (preserve permissions)
- `E` -- Preserve executability
- `delete` -- Delete file on the destination that don't exist on source; clean up
  deleted files in backup
- `stats` -- Give some file-transfer stats

Rsync is a program that efficiently transfers data between two sources. When I say
efficiently... well look at how well it handles hundreds of gigs:

```
Dec 25 00:00:48 RPi systemd[1]: Started Drive sync.
Dec 25 00:00:48 RPi drive-mirroring[1019]: ########### Drive mirroring starting at Mon Dec 25 00:00:48 UTC 2017 ###########
Dec 25 00:01:40 RPi drive-mirroring[1019]: Number of files: 79,953 (reg: 65,687, dir: 10,729, link: 3,504, dev: 33)
Dec 25 00:01:40 RPi drive-mirroring[1019]: Number of created files: 14 (reg: 13, dir: 1)
Dec 25 00:01:40 RPi drive-mirroring[1019]: Number of deleted files: 3 (reg: 3)
Dec 25 00:01:40 RPi drive-mirroring[1019]: Number of regular files transferred: 16
Dec 25 00:01:40 RPi drive-mirroring[1019]: Total file size: 458.53G bytes
Dec 25 00:01:40 RPi drive-mirroring[1019]: Total transferred file size: 35.53M bytes
Dec 25 00:01:40 RPi drive-mirroring[1019]: Literal data: 35.53M bytes
Dec 25 00:01:40 RPi drive-mirroring[1019]: Matched data: 0 bytes
Dec 25 00:01:40 RPi drive-mirroring[1019]: File list size: 131.07K
Dec 25 00:01:40 RPi drive-mirroring[1019]: File list generation time: 0.006 seconds
Dec 25 00:01:40 RPi drive-mirroring[1019]: File list transfer time: 0.000 seconds
Dec 25 00:01:40 RPi drive-mirroring[1019]: Total bytes sent: 38.05M
Dec 25 00:01:40 RPi drive-mirroring[1019]: Total bytes received: 11.82K
Dec 25 00:01:40 RPi drive-mirroring[1019]: sent 38.05M bytes  received 11.82K bytes  725.03K bytes/sec
Dec 25 00:01:40 RPi drive-mirroring[1019]: total size is 458.53G  speedup is 12,046.32
Dec 25 00:01:40 RPi drive-mirroring[1019]: ########### Drive mirroring completed at Mon Dec 25 00:01:40 UTC 2017 ###########
```

Of course the first transfer will not be nearly this fast, but all subsequent transfers
will only need to transfer the changes since last transfer.

### Systemd Scripts

Save this file as `/etc/systemd/system/drive-mirroring.service`:

```ini

[Unit]
Description=Drive sync

[Service]
Type=simple
ExecStart=/usr/local/bin/drive-mirroring
```

And finally the timer is saved as `/etc/systemd/system/drive-mirroring.timer`

```ini
[Unit]
Description=Drive sync

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

You can have a look at systemd timers to customize the frequency of the sync. I've set it
to sync weekly (which defaults to Mondays at 12AM).

For systemd to actually run the `drive-mirroring.timer`, it must first be enabled or
started (enabling will ensure it gets started after a reboot whereas a starting will not
cause it to be automatically started across reboots).

```
$ systemctl enable drive-mirroring.timer  # or replace `enable` with `start`
```

You can get information about the systemd timer or service using `systemctl
drive-mirroring.service` (hint -- the .service can be omitted, but anything else like a
.timer must be explicit).

And you can view the systemd logs for a particular service using `journalctl -u
drive-mirroring.service`. We've also piped the output of rsync to
`/var/log/drive-mirroring.log` so the output of rsync can also be accessed there.


[nixCraft1]: https://www.cyberciti.biz/faq/linux-modify-partition-labels-command-to-change-diskname/
