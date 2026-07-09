# Custom domain setup

When you buy a domain (e.g. `alessandrogayttan.dev` or `alessandrogayttan.com`):

## 1. GitHub Pages

1. Create file `CNAME` in repo root with your domain:
   ```
   alessandrogayttan.dev
   ```
2. GitHub → Settings → Pages → Custom domain → enter domain
3. At your domain registrar, add DNS records:
   - **A records** → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **OR CNAME** `www` → `alessandrogayttan.github.io`

## 2. Professional email

Options with your own domain:
- **Google Workspace** (~$6/mo) → `hello@yourdomain.com`
- **Zoho Mail** (free tier available)
- **Cloudflare Email Routing** (free forwarding to Gmail)

## 3. Update site config

Edit `site-config.js`:
- `domain`
- `email` (once you have professional email)
- `calendly` (create free account at calendly.com)
- `linkedin` (your real profile URL)

## 4. Replace photo

Add `assets/photo.jpg` and update `index.html` + `about.html`:
```html
<img src="assets/photo.jpg" alt="Alessandro Gayttan" ...>
```

## 5. Re-capture screenshots after domain change

```bash
python scripts/capture-screenshots.py
```
