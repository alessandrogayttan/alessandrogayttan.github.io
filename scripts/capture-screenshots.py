"""Capture desktop and mobile screenshots for the portfolio."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "assets" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

DESKTOP = [
    ("inpulso-home", "https://inpulso43.com"),
    ("inpulso-talleres", "https://inpulso43.com/talleres"),
    ("inpulso-campus", "https://inpulso43.com/campus"),
    ("inpulso-nosotros", "https://inpulso43.com/nosotros"),
    ("portfolio", "https://alessandrogayttan.github.io"),
]

MOBILE = [
    ("inpulso-home-mobile", "https://inpulso43.com"),
    ("inpulso-talleres-mobile", "https://inpulso43.com/talleres"),
    ("inpulso-campus-mobile", "https://inpulso43.com/campus"),
]

DESKTOP_SIZE = (1400, 900)
MOBILE_SIZE = (390, 844)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    for name, url in DESKTOP:
        print(f"Desktop: {name}")
        page.set_viewport_size({"width": DESKTOP_SIZE[0], "height": DESKTOP_SIZE[1]})
        page.goto(url, wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT / f"{name}.png"))

    for name, url in MOBILE:
        print(f"Mobile: {name}")
        page.set_viewport_size({"width": MOBILE_SIZE[0], "height": MOBILE_SIZE[1]})
        page.goto(url, wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT / f"{name}.png"))

    browser.close()

print("Done.")
