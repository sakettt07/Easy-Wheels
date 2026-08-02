import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

const public_routes = ["/"]
const public_apis = ["/api/auth"]
export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith(".")) {
        return NextResponse.next()
    }
    if (public_routes.includes(pathname)) {
        return NextResponse.next()
    }
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }
    const session = await auth();
    console.log("[PROXY] Path:", pathname);
    console.log("[PROXY] Session:", session ? "Exists" : "Null", "Role:", session?.user?.role);
    if (!session) {
        console.log("[PROXY] Redirecting to / because no session");
        return NextResponse.redirect(new URL("/", req.url));
    }
    const role = session.user?.role
    if (pathname.startsWith("/admin")) {
        if (role != "admin") {
            console.log("[PROXY] Redirecting to / because role is not admin");
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
    if (pathname.startsWith("/rider")) {
        if (pathname.startsWith("/rider/onboarding")) {
            return NextResponse.next();

        }
        if (role != "rider" && role != "admin") {
            console.log("[PROXY] Redirecting to / because role is not rider or admin", role);
            // return NextResponse.redirect(new URL("/", req.url));
        }
    }
    if (pathname.startsWith("/api")) {
        if (!session) {
            return Response.json({ message: "unauthorised" }, { status: 401 });
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)"],
};