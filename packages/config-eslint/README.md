# `@salonops/config-eslint` 📏

> **Shared ESLint configuration presets across the SalonOps monorepo.**

---

## 🌟 Capabilities

- Consistent code quality standards across Node.js, React, and Expo applications.
- Type-aware linting integration.
- Custom warning rules for unused variables with underscore exemption (`argsIgnorePattern: "^_"`).

---

## 🚀 Usage

In root `eslint.config.mjs` or package configurations:
```javascript
import baseConfig from "@salonops/config-eslint";

export default [
  ...baseConfig,
  // custom overrides
];
```
