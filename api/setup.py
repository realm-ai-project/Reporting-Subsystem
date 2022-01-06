from setuptools import setup, find_packages

setup(
    name='realm_report',
    version='0.0.1-beta',
    description="REALM_AI Reporting Subsystem",
    install_requires=[
        "python-dotenv",
        "flask-cors",
        "pandas",
        "numpy",
        "seaborn",
        "matplotlib",
        "scipy"
    ],
    python_requires=">=3.6.1",
    packages=find_packages(),
    package_data = {"realm_report": ["data/*.json", "data/*.dat"]},
    entry_points={
        "console_scripts": [
            "realm-report=realm_report.api:main",
        ]
    },
)