---
title: Local network domains using Dnsmasq
date: 2018-06-10
draft: true
---

Settings up a DNS server in a local network allows you to setup domain names for
local devices, services and project you have hosted on your network. Dnsmasq is a
simple DNS server, among other things, and we'll set it up on a local machine, point
other machines to use it as a DNS server and this will give us the ability to setup
domain names like `nextcloud.local` to reference a local Nextcloud instance, for example,
hosted on a Raspberry Pi from any device (assuming the device's DNS setting have be set
to the new DNS server). The alternative is to edit host files on each device every time
you want to add new a domain -- tedious and quite laborious.

Dnsmasq should be available on your Linux distro's repo, otherwise you'll need to
research how to install it for your particular system.

On Debian favored distros, you can install it using

    apt-get install dnsmaq

On Arch (including Arch Linux ARM) you can instal it using

    pacman -S dnsmasq

The should be a `/etc/dnsmasq.conf` file. We won't edit this directly, instead we'll
just uncomment or added this line to point Dnsmasq to our new config file

    # Include all files in a directory which end in .conf
    conf-dir=/etc/dnsmasq.d/,*.conf

And make the directory

    mkdir -p /etc/dnsmasq.d

Now create a file in this directory, I'll name it `localnetwork.conf`, and add the follow
to the file (you can omit the comment lines, `#`, if you prefer)

    # We only want DNS, and not DHCP or TFTP
    no-dhcp-interface=eth0

    # Do not forward private IP ranges (ie 192.168.x.x) to the upstream DNS servers
    bogus-priv

    # Answer such requests with "no such domain" instead
    expand-hosts
    domain-needed
    no-resolv
    no-poll
    server=192.168.1.1

<div class="warning">
When editing the host files, it is assumed the private IP for the device won't be
changing. Some router's will use DHCP to dynamically give out IPs to devices. You will
need to configure your router to reserve IPs for your devices you list in the hosts file.
</div>

Enable and start the `dnsmasq` service if you're using SystemD (if you're using something
else, you will need to see how to enable it for yourself)

    systemctl enable dnsmasq
    systemctl start dnsmasq

In my `/etc/hosts` file I can now specify domain names

    # Localhost
    127.0.0.1 rpi.local
    192.0.2.1 rpi.local

    # Machines
    192.0.2.2 laptop.local
    192.0.2.3 desktop.local

    # Domains
    192.0.2.1 nextcloud.local
    192.0.2.1 gitea.local

In order to use the DNS server, you'll need to point the device to the DNS server

https://support.opendns.com/hc/en-us/categories/204012907-OpenDNS-Device-Configuration


For Completeness, I've setup Nginx to reverse proxy applications and servers running on
the system based on the domain name

    server {
        listen 80;
        server_name nextcloud.local;

        location / {
            proxy_pass http://localhost:1234;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }

    server {
        listen 80;
        server_name gitea.local;

        location / {
            proxy_pass http://localhost:5678;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }

This will allow you to now type in 'gitea.local' in a browser and access the website just
like any other website
