/**
 * Proxies /api/* to the Spring Boot backend so users get ONE shareable URL.
 * Set API_ORIGIN in Cloudflare Pages → Settings → Environment variables.
 */
interface Env {
  API_ORIGIN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const origin = (env.API_ORIGIN || 'https://airbook-enterprise.fly.dev').replace(/\/$/, '');
  const url = new URL(request.url);
  const target = `${origin}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  const response = await fetch(target, init);
  const out = new Response(response.body, response);
  out.headers.set('Access-Control-Allow-Origin', url.origin);
  out.headers.set('Access-Control-Allow-Credentials', 'true');
  return out;
};
