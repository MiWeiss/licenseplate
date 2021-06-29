import os
import platform


def npm_build():
    os.system('npm install')
    os.system('npm run build')


def zip_extension():
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


if __name__ == '__main__':
    npm_build()
    zip_extension()
