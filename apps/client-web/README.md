# `@salonops/client-web` 🌐

> **Mobile-responsive client booking web application built with React 18.3, Vite, and Tailwind CSS, engineered for Instagram and WhatsApp bio links.**

---

## 🌟 Highlights & Features

- **Frictionless Bio Link Booking**: Instant 3-step booking flow without mandatory password creation or slow downloads.
- **Stylist Selection by Preference**: Clients select their favorite artist (*Fatima*, *Salma*, *Youssef*) or choose "First Available".
- **Real-Time Dynamic Availability**: Instant slot calculation incorporating service duration and mandatory sanitization buffer blocks.
- **Digital Pass Integration**: One-click "Add to Apple Wallet" and "Save to Google Wallet" pass generation with live appointment reminders.
- **Deposit & Prepayment Ready**: Pre-configured for Moroccan payment gateways (CMI / PayZone) on long services (color, balayage, lissage) to eliminate no-shows.

---

## 📁 Directory Structure

```text
apps/client-web/
├── src/
│   ├── App.tsx                  # Interactive client booking flow
│   ├── main.tsx                 # React DOM bootstrapping
│   └── index.css                # Luxury responsive styles
├── index.html                   # HTML entry point with mobile viewport optimization
├── package.json                 # Dependencies & Vite scripts
├── vite.config.ts               # Vite build configuration
└── tsconfig.json                # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create `.env` inside `apps/client-web/`:
```env
VITE_API_URL=http://localhost:4000/api/v1
```

---

## 🚀 Getting Started

```bash
# Start Vite development server (http://localhost:5174)
pnpm --filter @salonops/client-web dev

# Build production bundle
pnpm --filter @salonops/client-web build

# Preview production build locally
pnpm --filter @salonops/client-web preview

# Run typechecker
pnpm --filter @salonops/client-web typecheck
```
