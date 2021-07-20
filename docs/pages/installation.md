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
You can install the extension directly through the 
[chrome marketplace](https://chrome.google.com/webstore/detail/licenseplate/ipjjmoankphonkjgdpgmpkgmjgjeljmd).

#### Edge
You can also use install it from the [chrome marketplace](https://chrome.google.com/webstore/detail/licenseplate/ipjjmoankphonkjgdpgmpkgmjgjeljmd),
as long as you accept "third party stores".

Eventually, I'll also upload this to the edge store, but first I'll wait for some feedback.

#### Firefox and Safari
Firefox does not **yet** support manifest-v3 extensions, and safari requires me to work with a mac. 
I might work around these problems eventually, but it's probably not tomorrow :-)

### Installing it yourself
Using the extensions-developer mode in chrome, firefox or edge, you can add the unpacked licenseplate extension manually (just click on `load unpacked`).
You'll find an unpacked version of licenseplate shipped with the [latest release](https://github.com/MiWeiss/licenseplate/releases), e.g. `v0.2.0-unpacked`, or you can easily build the most recent version by cloning [the sources](https://github.com/MiWeiss/licenseplate) and running `npm run build` (unpacked extension lands in the `dist` folder).

