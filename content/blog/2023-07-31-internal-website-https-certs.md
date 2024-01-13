---
title: "Getting TLS certificates for internal HTTPs websites"
date: 2023-07-31T00:00:00-04:00
summary: "A short guide on acquiring Let's Encrypt TLS certificates for internal websites using the DNS challenge."
---


If you have a website that's only accessible on a non-public network, it can be
challenging to know how to setup HTTPs with a TLS certificate. There are
numerous guides online on creating a self-signed certificate. However,
using a self-signed certificate means you either have to configure each
device/browser that will need to accept that certificate to trust that
certificate or you will need to click past a browser HTTPs certificate warning page
every time you visit that internal website.

Ideally we'd use a free certificate from [Let's
Encrypt](https://letsencrypt.org/) that is already trusted by devices and
browsers without any additional work.

I had struggled to find an answer to this problem for a few years. So I had been
using self-signed certificates. However, I recently found the answer I was
seeking and it turned out to be very simple and straight forward to implement.

Let's Encrypt uses "challenges" to issue certificates. [There are numerous
challenge types](https://letsencrypt.org/docs/challenge-types/), but the DNS
challenge is the one that's relevant in the case of an internal website. Of
course, this assumes your DNS records are public. If you've got a non-public DNS
server, then this guide isn't going to help you in that case.

The idea is simple: add a few entries to the DNS record for your domain, wait
for the DNS changes to propagate, and run the Let's Encrypt client to request a
new certificate using the DNS challenge option.

Doing this manually is possible, but there is a great tool that makes it even
easier: [lego](https://github.com/go-acme/lego).

The best place to start would be the official docs: [Obtain a Certificate](https://go-acme.github.io/lego/usage/cli/obtain-a-certificate/).

As an example, here's what I used to perform the DNS challenge on a (wildcard)
domain I use for internal websites. Here, NameSilo, is my DNS provider, so I'm
using the NameSilo specific environment variables and options. You will need to
[consult the documentation](https://go-acme.github.io/lego/dns/#dns-providers)
to find your DNS provider's specific environment variables.

```txt
$ export NAMESILO_API_KEY=...
$ export NAMESILO_POLLING_INTERVAL=10 # seconds
$ export NAMESILO_PROPAGATION_TIMEOUT=1800 # seconds
$ export NAMESILO_TTL=3600 # seconds
$ lego --email me@my.email --dns namesilo --domains *.mydomain.com run
```

NameSilo is very slowly to publish and propagate the changes. Other DNS
providers may be faster, so you may be able to use a smaller propagation timeout
value.


## Manual Approach

Above I described the automated approach using lego. However, you can do the
steps manually.

First setup a Python [virtual
environment](https://docs.python.org/3/library/venv.html) and install
[Certbot](https://certbot.eff.org/). Note these instructions are for a Unix
shell (sh/bash), Windows may have different steps. You can choose to skip a
virtual environment, but I like to avoid pip installing things globally.

```txt
$ python3 -m venv venv # create a virtual environment
$ source venv/bin/activate # active the virtual environment
$ pip install certbot
```

Then run certbot,

```txt
$ certbot certonly \
    --manual \
    --preferred-challenges dns \
    --config-dir config \
    --logs-dir logs/ \
    --work-dir .
```

Then certbot will interactively ask for domains and tell you to add a
TXT DNS record. Once you've updated the DNS record, wait for propagation and
verify the DNS record with a tool like dig,

```txt
$ dig -t txt _acme-challenge.mydomain.com
```

Once you know the DNS record is propogated, you can press enter and certbot will
output the certificate files.
