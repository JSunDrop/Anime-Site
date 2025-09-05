# OtakuHub — Grande Pro V3 (Static Prototype)

What’s new in V3
- **Professional landing page**: hero + KPIs, feature grid, how‑it‑works, FAQ, and strong CTAs to Enter App / Start a Studio.
- **Command palette (Ctrl/⌘+K)** to jump anywhere quickly.
- **Explore upgrades**: sort by Trending / Newest / Top Liked, plus tag filters.
- **Reporting**: report a work with a reason; stored locally and gives a toast.
- **Toasts**: small notifications for key actions.
- Kept: Age gating by DOB, comments, forum, live chat, favorites, resume/start, marketplace with 1% fee.

Run
- Open `index.html`, or serve locally:
```bash
python3 -m http.server 8000
# visit http://localhost:8000/#/landing
```

Deploy to GitHub Pages
- Put the folder contents at the root of your GH Pages site or under a subfolder (hash routes work fine).

Pro tip
- In `index.html`, the default route goes to `#/landing`. If you want to start directly inside the app, change it to `#/home` in `app.js: route()`.
