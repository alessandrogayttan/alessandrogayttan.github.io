"""Capture live site screenshots for the portfolio."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "assets" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

PAGES = [
    ("inpulso-home", "https://inpulso43.com", 1400, 900),
    ("inpulso-talleres", "https://inpulso43.com/talleres", 1400, 900),
    ("inpulso-campus", "https://inpulso43.com/campus", 1400, 900),
    ("inpulso-nosotros", "https://inpulso43.com/nosotros", 1400, 900),
    ("portfolio", "https://alessandrogayttan.github.io", 1400, 900),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    for name, url, w, h in PAGES:
        print(f"Capturing {name} ...")
        page.set_viewport_size({"width": w, "height": h})
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT / f"{name}.png"), full_page=False)
        print(f"  -> {OUT / f'{name}.png'}")
    browser.close()

print("Done.")
