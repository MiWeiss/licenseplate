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
Python E2E selenium tests are in the folder `selenium`: `cd selenium`, creating a `venv` and runing `pip install -r requirements.txt` will allow you to execute `pytest .` 

### Next Steps and Roadmap
A bunch of ideas:
- :fire: Strengthen test suite (more unit, not just E2E).
- :ballot_box_with_check: Customizable alert levels, based on user-defined per-permission, per-limitation and per-condition configurations.
- :books: Also show licenseplate alerts on popular package indexes (e.g. [pypi.org](https://pypi.org)).
- :construction_worker: Define remote configs for page-dependent dom-element queries and style info, allowing to quickly react to page changes.

Want to work on any of these things? Open an issue to discuss the details...

### Project Structure

The following are the most relevant folders in this repository. Folders not listed here are hopefully self-explanatory.

```
.
├── public                  # Static resources
├── browser_control         # E2E tests and automated image generation for docs. Uses python & selenium
├── dist                    # The extension (built using `npm run build`) ends up here.
├── src                     # Source Files 
│   ├── __codegen__         # Code for static license info generation (run `npm run gen-licenses`)
│   ├── __gen__             # License info generated by __codegen__. Don't touch, will be overridden!
│   ├── __tests__           # Unit tests (JEST) for the few logical components of the extension
│   ├── github              # Any code specific to github repositories
│   └── utils               # Platform-independent utilities (e.g. caching, ignore-logic)
└── ...
```

## Thanks / Credits 
This repositories relies on the contributions of many other projects, amongst which:
* [choosealicense.com](https://choosealicense.com) (Information about licenses)
* [feathericons.com](https://feathericons.com) (multiple icons)
* [chibat/chrome-extension-typescript-starter](https://github.com/chibat/chrome-extension-typescript-starter) (repository template)

