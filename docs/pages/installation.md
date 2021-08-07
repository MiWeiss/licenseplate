---
layout: page
title: Installation
permalink: /installation/
has_children: false
nav_order: 20
---

## Installation

### Using a marketplace 
#### Chrome
Install from the 
[chrome web store](https://chrome.google.com/webstore/detail/licenseplate/ipjjmoankphonkjgdpgmpkgmjgjeljmd).

#### Edge
Install from
[microsoft edge add-ons](https://microsoftedge.microsoft.com/addons/detail/gfhcmhbpigcinkiechkibmgmllodaade).

#### Firefox and Safari
Firefox does not **yet** support manifest-v3 extensions (and licenseplate is such an extension), and safari requires a lot of special steps to get towards a store entry. 
I might work around these problems eventually, but probably not tomorrow :-)

### Installing it yourself
Using the extensions-developer mode in chrome, edge or with some additional work firefox, you can add the unpacked licenseplate extension manually (just click on `load unpacked`).
You'll find an unpacked version (`unpacked.zip`) shipped with the [latest release](https://github.com/MiWeiss/licenseplate/releases) or you can easily build the most recent version by cloning [the sources](https://github.com/MiWeiss/licenseplate) and running `npm run build` (unpacked extension lands in the `dist` folder).

