# `@salonops/admin-dashboard` 💻

> **Single Page Application (SPA) built with React 19.3, Vite, and Tailwind CSS for Moroccan salon owners and general managers.**

---

## 🌟 Highlights & Features

- **Executive Financial KPIs**: Real-time daily turnover in Moroccan Dirhams (MAD), active chair utilization, total appointments, and no-show rate tracking.
- **Caisse & Cash Reconciliation**: Track Cash drawer, TPE bank card receipts, and stylist tips before end-of-day closing.
- **Stylist Performance & Commission**: Individual stylist revenue breakdown and automated commission calculations (e.g. Fatima 15%, Salma 15%).
- **Multi-Branch Switching**: Fast selector to toggle between salon branches (e.g. Casablanca, Rabat, Marrakech, Béni Mellal).
- **Luxury Aesthetic**: Tailored dark theme (`#121214`) accented with Moroccan gold (`#D4AF37`) and subtle glassmorphic elements.

---

## 📁 Directory Structure

```text
apps/admin-dashboard/
├── src/
│   ├── App.tsx                  # Main executive dashboard view & layout
│   ├── main.tsx                 # React DOM bootstrapping
│   └── index.css                # Tailwind CSS tokens & dark theme
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & Vite scripts
├── vite.config.ts               # Vite configuration with React plugin
└── tsconfig.json                # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create `.env` inside `apps/admin-dashboard/`:
```env
VITE_API_URL=http://localhost:4000/api/v1
```

---

## 🚀 Getting Started

```bash
# Start Vite development server (http://localhost:5173)
pnpm --filter @salonops/admin-dashboard dev

# Build production bundle with TypeScript check
pnpm --filter @salonops/admin-dashboard build

# Preview production build locally
pnpm --filter @salonops/admin-dashboard preview

# Run typechecker
pnpm --filter @salonops/admin-dashboard typecheck
```
