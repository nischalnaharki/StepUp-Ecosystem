// This legacy filename is deliberately blocked. Book content is rendered only by the protected viewer route.
export async function GET() { return new Response("Book downloads are unavailable.", { status: 403 }); }
