// API routes function handler
export async function onRequest(context) {
    const { request, env } = context;

    // Forward API requests to the Next.js app
    return env.ASSETS.fetch(request);
}
