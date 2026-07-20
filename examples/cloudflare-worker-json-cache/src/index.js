const CACHE_TTL_SECONDS = 300; // 5 minutes
const ORIGIN_URL = "https://api.example.com"; // replace with your JSON API's origin

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "GET") {
      return fetch(request);
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url, request);

    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    const originUrl = new URL(request.url);
    originUrl.protocol = "https:";
    originUrl.host = new URL(ORIGIN_URL).host;

    const originResponse = await fetch(originUrl.toString(), request);

    if (!originResponse.ok) {
      return originResponse;
    }

    const response = new Response(originResponse.body, originResponse);
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);

    // Store a clone in cache; the original is returned to the client immediately.
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
