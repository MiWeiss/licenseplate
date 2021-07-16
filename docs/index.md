---
layout: page
title: About
permalink: /
nav_order: 10
---

# licenseplate

Licenseplate is a browser extension helping to quickly recognize github repositories
which are insufficiently licensed for common use-cases.
Amongst others functions, it injects potentially useful information about a licenses
permissions, conditions and limitations directly on a github repository view.

Built by [me](https://mweiss.ch) as a side-project for fun, personal use and to play a bit with new tech, 
it's available for free for anyone to use. 
Note that the software and documentation are provided [without any warranty](./../legal).

### Example
{% include gh-image.html 
    out_cd="."
    img="alertbar-nolicense-closed" 
    alt="Alertbar on repo without license file"
%}

### Is it actually useful?

The github license inspector and pages like *choosealicense.com* 
provide great resources to investigate licenses 
for any given repository.
Sometimes however, I am just a bit lazy, 
and grateful for an early warning thrown at me.
I think that here, I may not be alone...