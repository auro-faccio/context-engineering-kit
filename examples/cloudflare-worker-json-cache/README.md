# Cloudflare Worker: JSON API Cache

Reference Worker that caches JSON API responses for five minutes using the
Workers [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/).

This example is standalone reference code — this repository is a Claude Code
plugin marketplace and has no Cloudflare Workers deployment of its own.
Copy `src/index.js` and `wrangler.toml` into a new Workers project to use it.

## How it works

- On each `GET` request, checks `caches.default` (the zone-level edge cache)
  for a matching entry keyed by the request URL.
- On a cache hit, returns the cached response immediately — no origin fetch.
- On a cache miss, fetches the JSON response from `ORIGIN_URL`, sets
  `Cache-Control: public, max-age=300` (5 minutes) on the response, and
  stores it via `ctx.waitUntil(cache.put(...))` so the store happens in the
  background without delaying the response to the client.
- Non-`GET` requests bypass the cache and pass straight through.

## Setup

1. Install Wrangler and log in:

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Edit `ORIGIN_URL` in `src/index.js` to point at your JSON API's origin.

3. Run locally or deploy:

   ```bash
   wrangler dev
   wrangler deploy
   ```

## Notes

- The cache is per-Cloudflare-datacenter, not global — a request that lands
  in a different PoP within the 5-minute window will still hit the origin
  once. Use [Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
  or Workers KV if you need a single shared cache across all PoPs.
- The `max-age` value on the `Cache-Control` header is what the Cache API
  actually honors when deciding how long to keep the entry — the TTL lives
  on the response, not as a separate option to `cache.put()`.
- To vary the cache by query string, header, or auth state, adjust
  `cacheKey` (e.g. include specific headers, or strip query params you don't
  want to fragment the cache on).
