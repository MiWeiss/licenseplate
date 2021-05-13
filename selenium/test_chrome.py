from time import sleep
from typing import Optional

import pytest
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from selenium import webdriver

CACHE = dict()
WEBDRIVER_INSTALL_PATH = ChromeDriverManager().install()


def webdriver_setup():
    """Creates a new webriver and installs pre-packed extension."""
    options = Options()
    options.add_extension("../dist.crx")
    return webdriver.Chrome(
        executable_path=WEBDRIVER_INSTALL_PATH,
        options=options,
    )


def navigate_to_options(wd: WebDriver):
    """Identifies options-id if unknown and navigates to options page."""
    if "extension-id" not in CACHE.keys():
        wd.get("chrome://extensions")
        wd.find_element_by_tag_name('extensions-manager')
        details_button = wd.execute_script("return document.querySelector('extensions-manager')"
                                           ".shadowRoot.querySelector('extensions-item-list')"
                                           ".shadowRoot.querySelector('extensions-item')"
                                           ".shadowRoot.getElementById('detailsButton')")
        details_button.click()
        CACHE["extension-id"] = wd.current_url.split('=')[1]
    wd.get(f"chrome-extension://{CACHE['extension-id']}/options.html")


def clear_ignore_config(wd: WebDriver):
    """Navigates to options and removes all ignore configs."""
    navigate_to_options(wd)
    trash_icons = wd.find_elements_by_class_name("classlist-trash-icon")
    for tri in trash_icons:
        tri.click()
    wd.refresh()
    assert wd.find_elements_by_class_name("no-ignored-repos-message") is not None


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
    def test_ignore_repo(self, repo_1, repo_2, btn_id):
        """Tests ignoring of repositories and owners."""
        self.driver.get(f"https://github.com/{repo_1}")
        alert_bar = self._find_alert_bar()
        alert_bar.click()
        ignore_repo_button = WebDriverWait(self.driver, 1).until(
            expected_conditions.presence_of_element_located((By.ID, btn_id))
        )
        ignore_repo_button.click()
        # TODO once click reaction is improved to show 'revert', write corresponding test and
        sleep(0.5)
        self.driver.get(f"https://github.com/{repo_2}")
        with pytest.raises(TimeoutException):
            self._find_alert_bar()

    def _find_alert_bar(self) -> Optional[WebElement]:
        return WebDriverWait(self.driver, 2).until(
            expected_conditions.presence_of_element_located((By.ID, "licenseplate-alertbar"))
        )

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
