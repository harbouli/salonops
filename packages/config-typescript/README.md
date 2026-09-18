# `@salonops/config-typescript` ⚙️

> **Shared, reusable TypeScript configuration presets (`tsconfig.json`) across the SalonOps monorepo.**

---

## 🌟 Available Presets

- **`base.json`**: Core strict compiler options (`ES2022`, `NodeNext` module resolution, strict null checks, isolated modules).
- **`node.json`**: Extends `base.json` for Node.js 22 LTS microservices and Express backend (`@salonops/api`, `@salonops/database`).
- **`react.json`**: Extends `base.json` with React JSX transform (`react-jsx`) and DOM libraries for Vite frontends (`@salonops/admin-dashboard`, `@salonops/client-web`).
- **`react-native.json`**: Configured specifically for React Native and Expo SDK 52 with Metro bundler (`@salonops/staff-mobile`).

---

## 🚀 Usage

In any child `tsconfig.json`:
```json
{
  "extends": "@salonops/config-typescript/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```
