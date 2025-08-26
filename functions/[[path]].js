// Catch-all function for Next.js app routes
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
        // For API routes, we'll let Next.js handle them
        return env.ASSETS.fetch(request);
    }

    // Handle all other routes through the Next.js app
    return env.ASSETS.fetch(request);
}
