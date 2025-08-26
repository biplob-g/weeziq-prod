// Root path function handler
export async function onRequest(context) {
    const { request, env } = context;

    // Serve the index.html for the root path
    return env.ASSETS.fetch(request);
}
