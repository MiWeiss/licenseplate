import base64
import os
import shutil
from io import BytesIO

from PIL import Image
from selenium.webdriver.common.by import By
from selenium.webdriver.support.expected_conditions import presence_of_element_located
from selenium.webdriver.support.wait import WebDriverWait

from browser_control import utils

GEN_IMG_FOLDER_PATH = "../docs/images/generated"


def _safe_alertbar_screenshot(alertbar,
                              spec):
    base64img = driver.get_screenshot_as_base64()
    im = Image.open(BytesIO(base64.b64decode(base64img)))
    img_key = f"{GEN_IMG_FOLDER_PATH}/alertbar-{spec}"
    im.save(f"{img_key}-full.png", "png")

    coordinates = (
        0,
        alertbar.rect['y'] - 40,
        alertbar.rect['width'] + alertbar.rect['x'],
        alertbar.rect['height'] + alertbar.rect['y'] + 80
    )
    cropped = im.crop(coordinates)
    cropped.save(f"{img_key}-cropped.png", "png")


def pins_screenshot(owner_id: str):
    img_key = f"{GEN_IMG_FOLDER_PATH}/pins-{owner_id}"

    driver.get(f"https://github.com/{owner_id}")
    WebDriverWait(driver, 3).until(presence_of_element_located((By.CLASS_NAME, "licenseplate-badge")))
    pin = driver.find_element_by_class_name("js-pinned-items-reorder-container")
    cropped = Image.open(BytesIO(base64.b64decode(pin.screenshot_as_base64)))
    cropped.save(f"{img_key}-cropped.png", "png")

    base64img = driver.get_screenshot_as_base64()
    im = Image.open(BytesIO(base64.b64decode(base64img)))
    im.save(f"{img_key}-full.png", "png")


def alertbar_screenshot(repo_id: str,
                        lic: str):
    driver.get(f"https://github.com/{repo_id}")
    alertbar = WebDriverWait(driver, 3).until(presence_of_element_located((By.ID, "licenseplate-alertbar")))
    _safe_alertbar_screenshot(alertbar, f"{lic}-closed")
    alertbar.click()
    _safe_alertbar_screenshot(alertbar, f"{lic}-open")


if __name__ == '__main__':
    shutil.rmtree(GEN_IMG_FOLDER_PATH)
    os.mkdir(GEN_IMG_FOLDER_PATH)

    # utils.build_extension() TODO re-enable
    driver = utils.webdriver_setup()
    driver.set_window_size(1050, 1000)

    pins_screenshot("MachineDoingStuffByItself")

    # TODO include assertions verifying that licenses did not change
    #   (for the docs it's nice to use 'real' projects,
    #    and to not rely on dummies - this comes at the cost of
    #    not being able to influence the license)
    #   Until that's done, images have to be manually checked.
    alertbar_screenshot("HunterMcGushion/docstr_coverage", "mit")
    alertbar_screenshot("grafana/grafana", "agpl")
    alertbar_screenshot("itext/itext7", "unknown")
    alertbar_screenshot("SwissCovid/swisscovid-ux-screenflows", "nolicense")

    driver.close()
