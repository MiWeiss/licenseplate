---
layout: page
title: Repository Alertbar
parent: Use it on github.com
permalink: /features-gh/repo-view/
nav_order: 32
---

## Repository Alertbar

When browsing any repository on github, *licenseplate* will inject an alertbar on top of the the repository view.
According to the permissions, conditions and limitations, the alertbar is colored differently,
as can be seen in the following examples showing an MIT (very permissive) and a AGPL-3.0 (less permissive) license.

{% include gh-image.html 
    out_cd="../.."
    img="alertbar-mit-closed" 
    alt="Alertbar on repo with MIT license"
%}

<!-- Hack to put some space between the figures -->
<div style="height:15px"></div>

{% include gh-image.html 
    out_cd="../.."
    img="alertbar-agpl-closed" 
    alt="Alertbar on repo with AGPL-3.0 license"
%}


### Uncollapse the alertbar
Clicking on the alertbar will allow you to quickly review the identified license limitations, conditions and 
missing permissions, grouped into three levels (alert, warning, info), based on the presumed impact
of the identified potential license problem. 

{% include gh-image.html 
    out_cd="../.."
    img="alertbar-agpl-open" 
    alt="Uncollapsed alertbar on repo with AGPL-3.0 license"
%}


### Licenseplate Actions
All uncollapsed alertbars provide three actions, easily triggerd by corresponding button clicks.

#### Ignore Actions
Using the **Ignore Repo** and **Ignore Owner** buttons, licenseplate can be configured to not show any
information for the currently opened repository ("Ignore Repo") or for all repositories 
of the currently opened repositories owner ("Ignore Owner") on future page loads.
Typically, one would ignore a frequently used repository after verifying that it's license
 is sufficient for ones usecases. 
Similarly, one may want to ignore all their own repositories, or repositories of their employer.

Attention: Even if licenses change, ignored repos and owners remain ignored.
The list of ignored repos/owners can be seen and modified in the extension options.

#### Refresh Action
To reduce the number of requests to the github API, licenseplate caches identified licenses,
which may lead to changed licenses not being immediately discovered.
Clicking on "Refresh" forces a license reload. 
Hint: Want to clear the entire cache? There's a corresponding functionality in the extension options.

### Special Alertbars
Not for all repositories, licenseplate is able to identify the corresponding license. 
In particular, there are three such cases:

#### No License
If there's no license file (i.e., no *LICENSE*, *LICENSE.md* or alike), licenseplate splits out an alert,
as you're typically not allowed to use this repository.

{% include gh-image.html 
    out_cd="../.."
    img="alertbar-nolicense-closed" 
    alt="Alertbar on repo without license file"
%}

Note that sometimes license information is only mentioned in the README or the file headers,
which are not picked up by github (and thus also not by licenseplate).

Uncollapsing the alertbar will allow you to directly open a new issue, asking for a license.
Licenseplate will help you with that as well (see [request a license](./../request-license)).

#### Unknown License
If a license file was discovered, but it's content could not be mapped to a license,
an alertbar as follows is shown:

{% include gh-image.html 
    out_cd="../.."
    img="alertbar-unknown-closed" 
    alt="Alertbar on repo with unknown license"
%}

Often, this is caused by irrelevant deviations from known licenses.
For example, listing copyright holders on multiple lines (instead of just one)
may result in github (and thus licenseplate) not recognizing the license.
In such cases, you may want to review the license 
and then [licenseplate-ignore](#ignore-actions) the repo.

#### Repository not found
If the github API does not reply to our license info request, 
you're informed about it. 
Typically, this is not a big issue:
 You may be offline (in which case browing github isn't really fun anyways)
 or the repository your browsing is private.
In the latter case, you are typically (but not always!) a copyright holder of the repos content anyways
 and may want to [licenseplate-ignore](#ignore-actions) the repo or owner.

<!-- TODO include image -->
