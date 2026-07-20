# Next.js JWT Auth Middleware

Reference `middleware.ts` for the Next.js App Router that checks for a valid JWT in
cookies and redirects unauthenticated users to `/login`.

This example is standalone reference code — this repository is a Claude Code
plugin marketplace and has no Next.js application of its own, so nothing here
is wired into an app. Copy `middleware.ts` into the root of a Next.js project
(next to `app/` or `pages/`) to use it.

## Why `jose`

Middleware runs in the Edge Runtime, which doesn't have Node's `crypto`
module, so the popular `jsonwebtoken` package won't work there. [`jose`](https://github.com/panva/jose)
is built on the Web Crypto API and works in the Edge Runtime.

```bash
npm install jose
```

## Setup

1. Set the signing secret used to verify tokens:

   ```bash
   # .env.local
   JWT_SECRET=your-secret-key
   ```

2. Set the cookie your auth flow stores the JWT in. The example reads a
   cookie named `token` — change `AUTH_COOKIE_NAME` in `middleware.ts` to
   match your login route.

3. Adjust the `matcher` in `config` to fit your route structure. The default
   excludes `/login`, `/api/auth/*`, and Next.js internals so the redirect
   doesn't loop back onto the login page itself.

## How it works

- Reads the JWT from the `token` cookie via `request.cookies.get(...)`.
- If the cookie is missing, redirects to `/login?from=<original-path>`.
- If present, verifies the signature and expiry with `jwtVerify` from `jose`.
- On verification failure (expired, malformed, wrong secret), redirects to
  `/login` the same way.
- On success, calls `NextResponse.next()` to let the request through.

## Extending

- To also gate specific pages/roles, decode the verified payload
  (`jwtVerify` returns `{ payload }`) and check claims like `role` before
  calling `NextResponse.next()`.
- To refresh tokens, verify but proceed to call the refresh endpoint
  before checking expiry.
