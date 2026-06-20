import { NextResponse, type NextRequest } from "next/server";

// Lightweight gate for the internal review console. Not a replacement for real
// auth — it's a shared-password cookie so the team can use the console before
// Supabase Auth is wired up. The console is LOCKED unless CONSOLE_PASSWORD is set.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/console/login")) {
    return NextResponse.next();
  }

  const expected = process.env.CONSOLE_PASSWORD;
  const cookie = req.cookies.get("da_console")?.value;

  if (!expected || cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/console/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/console/:path*"],
};
