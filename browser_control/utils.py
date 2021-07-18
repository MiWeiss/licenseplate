import os
import platform

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver
from webdriver_manager.chrome import ChromeDriverManager

WEBDRIVER_INSTALL_PATH = ChromeDriverManager().install()


def build_extension():
    os.system('npm install')
    os.system('npm run build')

    if os.path.exists("../dist.crx"):
        os.remove("../dist.crx")
    if os.path.exists("../dist.pem"):
        os.remove("../dist.pem")

    path = os.path.abspath('../dist/')
    print("Building extension")
    if platform.system() == "Windows":
        os.system(f"chrome.exe --pack-extension={path}")
    elif platform.system() == "Linux":
        os.system(f'google-chrome --pack-extension={path}')
    else:
        raise RuntimeError(f"OS unsupported in by selenium prepare script {platform.platform()}")


def webdriver_setup():
    """Creates a new webriver and installs pre-packed extension."""
    options = Options()
    options.add_extension("../dist.crx")
    return webdriver.Chrome(
        executable_path=WEBDRIVER_INSTALL_PATH,
        options=options,
    )


