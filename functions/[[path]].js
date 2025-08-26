// Catch-all function for Next.js app routes
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    try {
        // Handle API routes
        if (url.pathname.startsWith('/api/')) {
            // For API routes, we'll let Next.js handle them
            return env.ASSETS.fetch(request);
        }

        // Handle all other routes through the Next.js app
        const response = await env.ASSETS.fetch(request);

        // If the asset fetch fails, try serving the index.html for SPA routing
        if (response.status === 404) {
            const indexRequest = new Request(new URL('/', url), request);
            return env.ASSETS.fetch(indexRequest);
        }

        return response;
    } catch (_error) {
        // Fallback to index.html for client-side routing
        const indexRequest = new Request(new URL('/', url), request);
        return env.ASSETS.fetch(indexRequest);
    }
}
