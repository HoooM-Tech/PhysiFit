import { NextRequest, NextResponse } from "next/server";

// NOTE: Middleware runs on Edge runtime. No DB calls, no Node-only modules here.
// Auth, idempotency, rate-limits run inside route handlers via lib/api wrappers.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const SECURITY_HEADERS: Record<string, string> = {
  // Lock down framing
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
  // HSTS: 1 year, include subdomains, preload-eligible
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Conservative CSP. Tailwind needs inline styles; Next.js needs unsafe-inline for
// hydration scripts in dev. Tighten further in production with nonces.
function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co"
    : "'self' 'unsafe-inline' https://js.paystack.co";
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.neon.tech wss://*.neon.tech https://api.paystack.co",
    "frame-src 'self' https://js.paystack.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function applySecurityHeaders(res: NextResponse) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  res.headers.set("Content-Security-Policy", buildCsp());
}

function applyCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Idempotency-Key, X-Request-Id"
    );
    res.headers.set("Access-Control-Max-Age", "600");
  }
}

export function middleware(req: NextRequest) {
  // CORS preflight: respond immediately
  if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api/")) {
    const res = new NextResponse(null, { status: 204 });
    applyCors(req, res);
    applySecurityHeaders(res);
    return res;
  }

  const res = NextResponse.next();

  // Request ID — generated here, surfaced to handlers via header (Edge-safe).
  const requestId = crypto.randomUUID();
  res.headers.set("x-request-id", requestId);

  applySecurityHeaders(res);
  if (req.nextUrl.pathname.startsWith("/api/")) {
    applyCors(req, res);
  }

  return res;
}

export const config = {
  // Run on all paths except Next internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
