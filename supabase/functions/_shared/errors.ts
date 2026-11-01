import { getCorsHeaders } from "./cors.ts";

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function jsonResponse(
  req: Request,
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function jsonError(
  req: Request,
  status: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  return jsonResponse(
    req,
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    status
  );
}
