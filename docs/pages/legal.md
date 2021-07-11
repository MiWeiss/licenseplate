---
layout: page
title: Legal Stuff
permalink: /legal/
has_children: false
nav_order: 60
---

# Legal Stuff

#### No Legal Advice & No Warranty

Similar to the github API, this code and browser extension **does not provide legal advice**
(cite taken from [here](https://docs.github.com/en/rest/reference/licenses)):

> GitHub is a lot of things, but it’s not a law firm. As such, GitHub does not provide legal advice. 
> Using the Licenses API or sending us an email about it does not constitute legal advice nor does 
> it create an attorney-client relationship. If you have any questions about what you can and can't 
> do with a particular license, you should consult with your own legal counsel before moving forward. 
> In fact, you should always consult with your own lawyer before making any decisions that might have
> legal ramifications or that may impact your legal rights.
> 
> GitHub created the License API to help users get information about open source licenses and the 
> projects that use them. We hope it helps, but please keep in mind that we’re not lawyers (at least 
> not most of us aren't) and that we make mistakes like everyone else. For that reason, GitHub provides 
> the API on an “as-is” basis and makes no warranties regarding any information or licenses provided 
> on or through it, and disclaims liability for damages resulting from using the API.

Not only does *licenseplate* rely on the Github API, but its developers are imperfect as well: 
Errors and faults in *licenseplate* will add to the above mentioned
imperfection. Thus, never trust the code in this repository, or any extension built from it.
You should always consult your lawyer before using anyone elses code and assets.

Furthermore; check the [MIT license](https://github.com/MiWeiss/licenseplate/blob/master/LICENSE),
under which licenseplate is distributed. 

#### Github
While licenseplate integrates with github, it is obviously not a product from github.

#### Data Collection
Licenseplate does not (on purpose) collect any information to share it with anyone but the user.
It does not create nor directly read any cookies.

User-specific data, such as ignored repositores or cached license information,
has to be stored by licenseplate for proper functioning. 
Such information is partially stored on the users browser local storage (e.g. using `chrome.storage.local`), 
and partially syncronized amongst users devices (e.g. using `chrome.storage.sync`).

#### Contact
If you have any questions, please open an issue [here](https://github.com/MiWeiss/licenseplate/issues).