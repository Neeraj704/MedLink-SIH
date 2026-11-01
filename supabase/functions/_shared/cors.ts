export const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const envOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowAll = allowedOrigins.concat(envOrigins);

  const matchedOrigin = allowAll.includes(origin) ? origin : allowAll[0] || "*";

  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-seed-token, accept",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}
