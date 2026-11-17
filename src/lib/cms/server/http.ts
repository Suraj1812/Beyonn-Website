import "server-only";
import { unstable_rethrow } from "next/navigation";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set(
    [new URL(request.url).origin, process.env.CMS_ALLOWED_ORIGIN].filter(
      Boolean,
    ),
  );
  if (
    !origin ||
    !allowed.has(origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new HttpError(403, "This request must come from the website.");
}
export function json(
  value: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
export function failure(error: unknown) {
  unstable_rethrow(error);
  if (error instanceof HttpError)
    return json(
      { error: error.message },
      error.status,
      error.status === 429 ? { "Retry-After": "900" } : {},
    );
  // Do not disclose cloud project configuration, access tokens or internal exception details.
  console.error(
    "CMS request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json(
    { error: "The content service is unavailable. Please try again shortly." },
    503,
  );
}
export async function limitedBody(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    throw new HttpError(413, "This request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is required.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    length += next.value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "This request is too large.");
    }
    chunks.push(next.value);
  }
  return Buffer.concat(chunks);
}
export async function parseJson(
  request: Request,
  maxBytes = 900_000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "Use JSON content.");
  try {
    const value: unknown = JSON.parse((await limitedBody(request, maxBytes)).toString("utf8"));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Use a JSON object.');
    return value;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Invalid JSON content.");
  }
}
