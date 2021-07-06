<p align="center">  
A browser extension to help you detect unpermissive licenses.
</p>

<p align="center">
<img width="60%" alt="licenseplate" src="docs/licenseplate.png">
</p>



## Installation
Sooner or later, you will be able to install this from the extension store of your choice on a variety of browsers. 
Before that's set up, feel free to build the application from source (`npm run build`) and manually add it to chrome (extensions -> enable developer mode -> load unpacked).

## Features
Licenseplate adds an alertbar when browsing any repository, indicating the license state (panic, warn, chill) and additional information, such as the permissions, conditions and limitation of the repositories license. Repos and owners can be excluded from such analysis, avoiding to spam views of frequently visited repositories.
In addition, licenseplate provides an issue template to request licenses on repositories without license.
Check the [roadmap](#next-steps-and-roadmap) for the next planned features, amongst which are proper docs :innocent:.

## Development
Contibutions are very welcome! In particular from, but not limited to, people having a better flair for style than I have :-) 
Before you make a major contribution, it's probably best to first discuss it in an issue.
⚠️ When implementing a change, please keep the number of API requests to a minimum, and don't include **any** external packages.

Develop using `npm run watch`, build using `npm run build`, test using `npm run test` and get the latest license versions from choosealicense using `npm run gen-licenses`.
Run the python E2E selenium tests as follows: `cd selenium`, creating a `venv` and `pip install -r requirements.txt` and then running `python prepare.py` will allow you to execute `pytest .` 

### Next Steps and Roadmap
Short Term
- :fire: Strengthen test suite.
- :nail_care: Improve style and appearance of alert bar. **HELP NEEDED :sos:**
- :ballot_box_with_check: Customizable alert levels, based on user-defined per-permission, per-limitation and per-condition configurations.
- :rotating_light: Emphasize license info and alert level on github user and organization pages.
- :blue_book: Docs!

Long Term
- :books: Also show licenseplate alerts on popular package indexes (e.g. [pypi.org](https://pypi.org)) and search engines (e.g. [google.com](https://google.com)).
- :construction_worker: Define remote configs for page-dependent dom-element queries and style info, allowing to quickly react to page changes.

Want to work on any of these things? Open an issue to discuss the details...

### Project Structure

The following are the most relevant folders in this repository. Folders not listed here are hopefully self-explanatory.

```
.
├── public                  # Static resources
├── selenium                # E2E tests (python). Require chrome webdriver in your path.
├── dist                    # The extension (built using `npm run build`) ends up here.
├── src                     # Source Files 
│   ├── __codegen__         # Code for static license info generation (run `npm run gen-licenses`)
│   ├── __gen__             # License info generated by __codegen__. Don't touch, will be overridden!
│   ├── __tests__           # Unit tests (JEST) for the few logical components of the extension
│   ├── github              # Any code specific to github repositories
│   └── utils               # Platform-independent utilities (e.g. caching, ignore-logic)
└── ...
```

## Legal Stuff

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

Furthermore; check the [MIT license](https://github.com/MiWeiss/licenseplate/blob/master/LICENSE) of this repository,
which excludes any liability from the contributors of this repository

## Thanks / Credits 
This repositories relies on the contributions of many other projects, amongst which:
* [choosealicense.com](https://choosealicense.com) (Information about licenses)
* [feathericons.com](https://feathericons.com) (trash icon)
* [chibat/chrome-extension-typescript-starter](https://github.com/chibat/chrome-extension-typescript-starter) (repository template)

