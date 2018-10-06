---
title: How to access the McMaster CAS virtual machines on Linux host
date: 2017-01-10
---

<div class="note">
There is a web client available, but still requires a connect to the VPN. See
CAS wiki<a href="#ref 1">[ref 1]</a> for more information.
</div>

## Using `openconnect`

Install openconenct

`openconnect sslvpn.mcmaster.ca`
(try with sudo if it fails)

If nothing failed, you should be connected

Tested on Xubuntu and Debian (x86\_64).

Download the VPN client for linux, `*.tar.gz` from
[https://www.mcmaster.ca/uts/network/vpn/](https://www.mcmaster.ca/uts/network/vpn/)

Download the VMWare Horizon client, `*bundle` from
[https://www.vmware.com/go/viewclients](https://www.vmware.com/go/viewclients)

`cd` to the location of both downloads

Install libudev1 and libpangox-1.0-dev and if it is not already installed

    $ sudo apt-get update && sudo apt-get install libudev1 libpangox-1.0-dev

Extract the VPN client

    $ tar xzf anyconnect-predeploy-linux-64-*.tar.gz    # file name may vary

`cd` into the extracted directory

    $ cd anyconnect-*    # directory name may vary

`cd` into the `vpn` directory

Install the VPN

    $ sudo ./install_vpn.sh

`cd` back to directory where the files were downloaded to

    $ cd ../../

Install VMWare Horizon client

    $ sudo bash VMware-Horizon-Client-*.x64.bundle    # file name may vary

Create a symlink [[notes 1]](#notes 1)

    $ ln -sf /lib/x86_64-linux-gnu/libudev.so.1 /lib/x86_64-linux-gnu/libudev.so.0

Connect to McMaster's VPN using Cisco AnyConnect (executable's location is
`/opt/cisco/anyconnect/bin/vpnui`). See UTS VPN page[[ref 3]](#ref 3) for more
information about connecting to the VPN

Connect to virtual desktop using VMWare Horizon Client (executable's location is
`/usr/local/bin/vmware-view`). See CAS wiki page[[ref 1]](#ref 1) for more information
about connecting to the virtual desktop

---


Notes
=====
1. <a name="notes 1"></a>`libudev.so.0` is required for the Horizon client, but
it appears that it is no longer available in the main repositories. Instead, for the
purposes of accessing the CAS Virtual Machines, symbolic linking `libudev.so.1` to
`libudev.so.0` works. [[ref 2]](#ref 2)


References
==========
1. <a name="ref 1"></a>[CAS Virtual Desktop wiki page](http://www.cas.mcmaster.ca/support/index.php/Virtual_Desktop)

2. <a name="ref 2"></a>[Ask Ubuntu answer regarding libudev.so.0](http://askubuntu.com/a/288822)

3. <a name="ref 3"></a>[McMaster UTS VPN page](http://www.mcmaster.ca/uts/network/vpn/)
