import os
import subprocess

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.remote.webdriver import WebDriver

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
EXTENSION_PATH = os.path.join(REPO_ROOT, "dist")


def build_extension():
    """Builds the extension into the `dist` folder. Expects dependencies to be installed (`npm ci`)."""
    subprocess.run(["npm", "run", "build"], cwd=REPO_ROOT, check=True)


def webdriver_setup() -> WebDriver:
    """Creates a new webdriver with the unpacked extension (`dist` folder) loaded.

    Branded Google Chrome ignores `--load-extension` since version 137,
    thus `CHROME_BINARY` has to point to a Chrome for Testing or Chromium binary.
    `CHROMEDRIVER` is optional: If not set, Selenium Manager provides a matching driver.
    """
    chrome_binary = os.environ.get("CHROME_BINARY")
    if not chrome_binary:
        raise RuntimeError("Set CHROME_BINARY to a Chrome for Testing or Chromium binary "
                           "(branded Google Chrome does not load unpacked extensions from the command line).")
    options = Options()
    options.binary_location = chrome_binary
    options.add_argument(f"--load-extension={EXTENSION_PATH}")
    return webdriver.Chrome(
        service=Service(os.environ.get("CHROMEDRIVER")),
        options=options,
    )
