from setuptools import setup
from setuptools.command.install import install

class PostInstallCommand(install):
    def run(self):
        install.run(self) # Call the parent install method
        # Your custom post-installation code here
        print("Running custom post-installation tasks...")
        from build import build
        build()

setup(
    cmdclass={
        'install': PostInstallCommand,
    },
)