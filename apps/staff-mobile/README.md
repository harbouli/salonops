# `@salonops/staff-mobile` 📱

> **React Native mobile application (Expo SDK 52) designed for Moroccan salon floor hairdressers, barbers, and salon owners.**

---

## 🌟 Highlights & Features

- **Per-Stylist Agenda & Carousel**: Filter appointments by Fatima, Salma, or Youssef. Real-time 09:00–20:00 schedule with visual buffer indicators.
- **"Notebook Killer" Client File**: Search by Moroccan phone number (`06...` / `07...`), track hair history, scalp sensitivity alerts, and color formula cards.
- **Color Formula Vault**: Record bleach powder weight, developer volume (20/30/40 Vol), shade ratio, processing minutes, and attach before/after camera transformation photos.
- **Bilingual French & Moroccan Darija RTL**: Seamless language toggle supporting Right-to-Left (RTL) Arabic layout with native `I18nManager`.
- **Caisse & Fast Checkout**: Split ticket calculation between Cash, TPE credit card, and direct stylist tips.
- **ROI Pitch Mode**: Interactive tool demonstrating how recovering 2 no-shows/day saves Moroccan salons ~1,800 MAD/month.

---

## 📁 Directory Structure

```text
apps/staff-mobile/
├── app/
│   ├── _layout.tsx              # Root Stack navigation & bilingual theme provider
│   └── (tabs)/
│       ├── _layout.tsx          # Bottom tab bar with gold active states
│       ├── agenda.tsx           # Stylist timeline, booking modal & buffer indicator
│       ├── clients.tsx          # Client file search, formula card & photo gallery
│       ├── caisse.tsx           # End-of-day register, split payment & tip manager
│       └── pitch.tsx            # Owner ROI calculator & pitch presentation
├── locales/
│   ├── fr.json                  # French translations
│   └── ar.json                  # Moroccan Darija (Arabic script) translations
├── assets/                      # Icons, splash screen & local images
├── app.json                     # Expo SDK 52 application configuration
├── babel.config.js              # Expo Router babel configuration
├── package.json                 # Dependencies & Expo scripts
└── tsconfig.json                # TypeScript configuration
```

---

## ⚙️ Environment Variables

Create `.env` in this directory (or pass via Expo configuration):
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🚀 Getting Started

### 1. Install Dependencies
From the monorepo root:
```bash
pnpm install
```

### 2. Start Expo Metro Bundler
```bash
pnpm --filter @salonops/staff-mobile dev
```

### 3. Run on Device / Simulator
- **iOS Simulator**: Press `i` in the terminal (macOS with Xcode required).
- **Android Emulator**: Press `a` in the terminal (Android Studio required).
- **Physical Device**: Install **Expo Go** on iOS or Android and scan the QR code displayed in the terminal.

---

## 📱 Production Builds with EAS (Expo Application Services)

To build native `.ipa` (iOS) or `.apk` / `.aab` (Android) binaries:
```bash
# Login to your Expo account
npx eas login

# Configure EAS project
npx eas build:configure

# Trigger remote cloud build
npx eas build --platform all --profile production
```

---

## 🧪 Quality & Typechecking

```bash
pnpm --filter @salonops/staff-mobile typecheck
```
