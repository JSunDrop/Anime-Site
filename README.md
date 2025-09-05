# OtakuHub — Grande Edition (Static Prototype)

A more cinematic, bolder version of the previous prototype with:
- **Animated cosmic background** (canvas stars + subtle parallax glow)
- **Cinematic hero** with CTAs
- **Featured carousel** and **tag chips** with filters
- **Bigger cards**, motion flourishes, soft glows, and FF7-inspired blue palette
- Explore, Work/Reader, Leaderboard, Market with 1% platform fee breakdown
- Studio & Publish flows (pages saved to localStorage)

> No backend. Safe to host on GitHub Pages / Netlify / Vercel. Everything persists in localStorage.

## Run
Double-click `index.html` or serve locally:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Notes
- "Video" remains a placeholder. Replace with HLS when adding a backend.
- Payments are simulated; swap `simulateCheckout()` with Stripe Connect later.
