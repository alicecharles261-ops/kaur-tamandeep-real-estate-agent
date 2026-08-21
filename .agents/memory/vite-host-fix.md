---
name: Vite host fix for Replit
description: The Lovable vite config defaults to IPv6 (:::8080) which Replit doesn't support; must override to 0.0.0.0:5000.
---

# Vite host fix for Replit sandbox

## The rule
Always add a server override in `vite.config.ts` for this project:

```ts
vite: {
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
  },
}
```

**Why:** `@lovable.dev/vite-tanstack-config` defaults to port 8080 with IPv6 (`::`) which throws `EAFNOSUPPORT` on Replit's Linux container.

**How to apply:** Pass the override in the `defineConfig()` call. The Lovable config merges it correctly.
