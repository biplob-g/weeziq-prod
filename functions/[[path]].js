// Catch-all function for Next.js static export routes
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    try {
        // Handle API routes
        if (url.pathname.startsWith('/api/')) {
            // For API routes, we'll let Next.js handle them
            return env.ASSETS.fetch(request);
        }
        
        // Handle static files first
        const response = await env.ASSETS.fetch(request);
        
        // If the asset fetch fails, try serving the index.html for SPA routing
        if (response.status === 404) {
            // Try with trailing slash
            const pathWithSlash = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
            const slashRequest = new Request(new URL(pathWithSlash, url), request);
            const slashResponse = await env.ASSETS.fetch(slashRequest);
            
            if (slashResponse.status === 404) {
                // Fallback to index.html for client-side routing
                const indexRequest = new Request(new URL('/', url), request);
                return env.ASSETS.fetch(indexRequest);
            }
            
            return slashResponse;
        }
        
        return response;
    } catch (_error) {
        // Fallback to index.html for client-side routing
        const indexRequest = new Request(new URL('/', url), request);
        return env.ASSETS.fetch(indexRequest);
    }
}
