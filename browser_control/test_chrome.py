from time import sleep
from typing import Optional

import pytest
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait

from browser_control.utils import build_extension, webdriver_setup

CACHE = dict()

build_extension()


def navigate_to_options(wd: WebDriver):
    """Identifies options-id if unknown and navigates to options page."""
    if "extension-id" not in CACHE.keys():
        # Try to find extension ID by checking all possible extension URLs
        # Since we know the options page exists at options.html
        # we can bruteforce check common extension ID formats
        # Better approach: read from filesystem or parse the extension
        import os
        import json
        import zipfile

        # Read manifest from the .crx file or dist folder
        manifest_path = "../dist/manifest.json"
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
                # Manifest doesn't contain ID, so we need another approach

        # Alternative: Extract from chrome://extensions page with different method
        wd.get("chrome://extensions")

        # Enable developer mode to see IDs
        dev_mode_script = """
            const manager = document.querySelector('extensions-manager');
            if (manager && manager.shadowRoot) {
                const toolbar = manager.shadowRoot.querySelector('extensions-toolbar');
                if (toolbar && toolbar.shadowRoot) {
                    const devModeToggle = toolbar.shadowRoot.querySelector('#devMode');
                    if (devModeToggle && !devModeToggle.checked) {
                        devModeToggle.click();
                    }
                }
            }
        """
        wd.execute_script(dev_mode_script)

        # Wait a moment for UI to update
        sleep(1)

        # Now try to extract IDs
        extension_id = wd.execute_script("""
            const manager = document.querySelector('extensions-manager');
            if (!manager || !manager.shadowRoot) return null;

            const itemList = manager.shadowRoot.querySelector('extensions-item-list');
            if (!itemList || !itemList.shadowRoot) return null;

            const items = itemList.shadowRoot.querySelectorAll('extensions-item');
            for (let item of items) {
                if (!item) continue;
                const itemId = item.getAttribute('id');

                if (item.shadowRoot) {
                    // With dev mode on, look for extension ID displayed
                    const allText = item.shadowRoot.textContent || '';
                    if (allText.toLowerCase().includes('licenseplate')) {
                        return itemId;
                    }
                }
            }
            return null;
        """)

        if not extension_id:
            raise RuntimeError("Could not find licenseplate extension in Chrome extensions")

        CACHE["extension-id"] = extension_id
    wd.get(f"chrome-extension://{CACHE['extension-id']}/options.html")


def clear_ignore_config(wd: WebDriver):
    """Navigates to options and removes all ignore configs."""
    navigate_to_options(wd)
    trash_icons = wd.find_elements(By.CLASS_NAME, "classlist-trash-icon")
    for tri in trash_icons:
        tri.click()
    wd.refresh()
    assert wd.find_elements(By.CLASS_NAME, "no-ignored-repos-message") is not None


class CacheChecker:
    """A selenium checker, testing for the presence and correctness of cache info in the options."""

    def __init__(self, cache_size_overall: int, cache_size_expired: int):
        self.overall: int = cache_size_overall
        self.expired: int = cache_size_expired

    def __call__(self, d: WebDriver) -> bool:
        return (
                d.find_element(By.ID, "cache-size").get_attribute('innerHTML') == str(self.overall)
                and
                d.find_element(By.ID, "expired-cache-size").get_attribute('innerHTML') == str(self.expired)
        )


class TestChromeExtensionOnGithub:
    """E2E tests of the extension on chrome."""

    driver: WebDriver = None

    @classmethod
    def setup_class(cls):
        """Dependency setup ONCE for all test."""
        # Creating a webdriver as few times as possible
        #   will help saving API requests once caching is enabled.
        cls.driver = webdriver_setup()

    @classmethod
    def teardown_class(cls):
        """Cleanup before terminating test class."""
        cls.driver.quit()

    def setup_method(self, test_method):
        """Cleans up before every test method"""
        clear_ignore_config(self.driver)

    def _find_alert_bar(self) -> Optional[WebElement]:
        return WebDriverWait(self.driver, 2).until(
            expected_conditions.presence_of_element_located((By.ID, "licenseplate-alertbar"))
        )

    @pytest.mark.parametrize("repo_id, exp_level",
                             [
                                 (
                                         "testingautomated-usi/uncertainty-wizard",
                                         "chill"
                                 ),
                                 (
                                         "MiWeiss/fake-license-repo",
                                         "panic"
                                 ),
                                 (
                                         "spectrumauctions/sats",
                                         "warn"
                                 ),
                             ],
                             ids=["MIT (chill)", "NO-LICENSE (panic)", "AGPL-3.0 (warn)"]  # TODO Add more
                             )
    def test_alert_level(self, repo_id: str, exp_level: str):
        """Ensures that alert bars are present and show the correct alert level."""
        self.driver.get(f"https://github.com/{repo_id}")
        alert_bar = self._find_alert_bar()
        assert alert_bar is not None
        assert f"licpl-{exp_level}" in alert_bar.get_attribute("class")

    @pytest.mark.parametrize("repo_1, repo_2, btn_id",
                             [
                                 (
                                         "testingautomated-usi/uncertainty-wizard",
                                         "testingautomated-usi/uncertainty-wizard",
                                         "btn-ignore-repo"
                                 ),
                                 (
                                         "testingautomated-usi/uncertainty-wizard",
                                         "testingautomated-usi/selforacle",
                                         "btn-ignore-owner"
                                 ),
                             ],
                             ids=["ignore-repo", "ignore-owner"]
                             )
    def test_ignore(self, repo_1, repo_2, btn_id):
        """Tests ignoring of repositories and owners."""
        # Setup
        self.driver.get(f"https://github.com/{repo_1}")
        alert_bar = self._find_alert_bar()
        alert_bar.click()

        # Click ignore button
        ignore_repo_button = WebDriverWait(self.driver, 1).until(
            expected_conditions.presence_of_element_located((By.ID, btn_id))
        )
        ignore_repo_button.click()

        # Make sure revert button is present and works
        revert_button = WebDriverWait(self.driver, 1).until(
            expected_conditions.presence_of_element_located((By.ID, "licenseplate-ignore-revert-btn"))
        )
        revert_button.click()
        ignore_repo_button = WebDriverWait(self.driver, 1).until(
            expected_conditions.presence_of_element_located((By.ID, btn_id))
        )

        # Make sure ignoring actually works
        ignore_repo_button.click()
        #   (waiting for revert button as this means that ignore action has completed)
        WebDriverWait(self.driver, 1).until(
            expected_conditions.presence_of_element_located((By.ID, "licenseplate-ignore-revert-btn"))
        )
        self.driver.get(f"https://github.com/{repo_2}")
        with pytest.raises(TimeoutException):
            self._find_alert_bar()

    @pytest.mark.parametrize("repo_id, exp_btn",
                             [
                                 (
                                         "testingautomated-usi/uncertainty-wizard",
                                         False
                                 ),
                                 (
                                         "MiWeiss/fake-license-repo",
                                         True
                                 ),
                                 (
                                         "spectrumauctions/sats",
                                         False
                                 ),
                             ],
                             ids=["MIT (not present)", "NO-LICENSE (present)", "AGPL-3.0 (not present)"]
                             )
    def test_request_license_btn(self, repo_id: str, exp_btn: bool):
        """Make sure the request license button is present only where it should"""
        self.driver.get(f"https://github.com/{repo_id}")
        alert_bar = self._find_alert_bar()
        alert_bar.click()

        def get_btn():
            return WebDriverWait(self.driver, 1).until(
                expected_conditions.presence_of_element_located(
                    (By.ID, "btn-create-license-request-issue")
                )
            )

        if exp_btn is True:
            assert get_btn() is not None
        else:
            with pytest.raises(TimeoutException):
                get_btn()
        # Note, as these tests still run unauthenticated, we cannot test the issue filling atm.

    @pytest.mark.parametrize("profile_with_pins, repo, icon_color, text",
                             [
                                 (
                                         "MachineDoingStuffByItself", "MachineDoingStuffByItself",
                                         "red", "No license"
                                 ),
                                 (
                                         "MachineDoingStuffByItself", "licenseplate",
                                         "green", "MIT"
                                 ),
                                 (
                                         "MachineDoingStuffByItself", "AGPL-Repo",
                                         "orange", "AGPL-3.0"
                                 ),
                                 (
                                         "MachineDoingStuffByItself", "strange-license-repo",
                                         "red", "OTHER"
                                 ),
                             ]
                             )
    def test_profile_pins(self, profile_with_pins, repo, icon_color, text):
        """Verifies that the correct, expected badges are added to profile pins."""
        # Open profile if not already there (if check to avoid unnecessary page loads)
        if self.driver.current_url != f"https://github.com/{profile_with_pins}":
            self.driver.get(f"https://github.com/{profile_with_pins}")
        pins_title = self.driver.find_element(By.CSS_SELECTOR, f"span[title='{repo}']")
        assert pins_title is not None, \
            f"No pin for repository named {repo} found on {profile_with_pins}'s profile"
        pin = pins_title.find_element(By.XPATH, "../../..")
        # Sanity check to make sure correct element is selected
        #   and that the class (on which logic relies) is set
        assert "pinned-item-list-item-content" in pin.get_attribute("class").replace(" ", "").split(",")
        badge = WebDriverWait(pin, 3).until(
            expected_conditions.presence_of_element_located((By.CLASS_NAME, "licenseplate-badge"))
        )
        assert badge.find_element(By.CSS_SELECTOR, f"svg[stroke='{icon_color}']"), \
            f"No icon with stroke color {icon_color} found"
        assert badge.find_element(By.TAG_NAME, "span").get_attribute('innerHTML') == text, \
            f"Licenseplate-badge dos not have text '{text}'"

    def test_cache(self):
        """Tests license key caching and cache clearance."""
        # Clear existing cache
        navigate_to_options(self.driver)
        self.driver.find_element(By.ID, "clear-cache-btn").click()
        WebDriverWait(self.driver, 1).until(CacheChecker(0, 0))
        # Visit to repos, then check that cache size is two
        self.driver.get("https://github.com/miweiss/licenseplate")
        self._find_alert_bar()
        # Wait for the caching delay
        sleep(1.5)
        self.driver.get("https://github.com/testingautomated-usi/uncertainty-wizard")
        self._find_alert_bar()
        # Wait for the caching delay
        sleep(1.5)
        navigate_to_options(self.driver)
        WebDriverWait(self.driver, 1).until(CacheChecker(2, 0))
        # Clear cache
        self.driver.find_element(By.ID, "clear-cache-btn").click()
        WebDriverWait(self.driver, 1).until(CacheChecker(0, 0))
