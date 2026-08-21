---
name: Node.js 22 required for Supabase
description: Supabase Realtime requires native WebSocket which is only in Node.js 22+. Node 20 causes blank SSR page.
---

# Node.js 22 required

## The rule
This project requires **nodejs-22** (or higher). Do not downgrade.

**Why:** `@supabase/realtime-js` initializes a WebSocket client during SSR. Node 20 lacks native WebSocket, causing the SSR to fail and fall back to a blank client-rendered page with no visible error.

**How to apply:** Install via `installProgrammingLanguage({ language: "nodejs-22" })`.
