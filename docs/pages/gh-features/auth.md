---
layout: page
title: Github Api Limits
parent: Use it on github.com
permalink: /features-gh/auth/
nav_order: 39
---

## Dealing with the github API limits
By default, licenseplate makes unauthenticated requests to the github API;
which imposes a limit of 60 requests per IP per hour.
Most of the time, this limit leads to no problem as
licenseplate uses caching to reduce the number of API requests.

However, if you are browsing like crazy, share your IP address with others,
or run other github-api calling apps, you may eventually exceed the limit:
Licenseplate will stop showing badges on pins, and will show "API limit reached" 
alertbars on all repositories.
Then, you may want to add a github authentication token to licenseplate.

### Adding a github authentication token
Given a github 
[*personal access token*](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)
(`chrome://extensions` -> Licenseplate -> Options), 
licenseplate can make up to 5000 API requests per hour.

Warning - Read the following carefully
{: .label .label-red }

Licenseplate stores the auth token unencrypted in your browsers `storage.sync`, which causes some security issues.
For example, by physically logging in on your machine,
by XSS attacks on licenseplate or by browser bug exploits an attacker could in theory read your token.
Before adding a token, make sure that you are aware of all risks associated with storing a token in the extensions `storage.sync`.

In addition, always follow the following two advices:
1. Don't add a token to licenseplate if getting it read by an attacker could cause you any harm!   
2. Never **ever** add a token to licenseplate which has any scopes (~ permissions) assigned. 
For many critical operations through the github API,
used token must be given specific scopes. 
Licenseplate does not require any such scopes, and by giving it a token with no extra permissions,
the negative impact of a token loss might be drastically reduced.
Read more about scopes [here](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps).

**By the way:** The way we handle github tokens is similar to other browser 
extensions (with 40'000+ users).
<!-- e.g. [enhanced-github](https://github.com/softvar/enhanced-github) which stores in local storage -->
Thus, if you are concerned that these security risks are too big for you,
 I recommend checking your other extensions as well!