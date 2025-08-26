// Cloudflare Pages Functions handler for Next.js
export default {
  async fetch(request, env, ctx) {
    // Handle API routes
    if (request.url.includes('/api/')) {
      // Let Cloudflare Pages Functions handle API routes
      return env.ASSETS.fetch(request);
    }
    
    // Handle all other routes through the Next.js app
    return env.ASSETS.fetch(request);
  }
};
