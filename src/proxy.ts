import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

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
    if (!session) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    const role = session.user?.role
    if (pathname.startsWith("/admin")) {
        if (role != "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
    if (pathname.startsWith("/rider")) {
        if (pathname.startsWith("/rider/onboarding")) {
            return NextResponse.next();

        }
        if (role != "rider") {
            return NextResponse.redirect(new URL("/", req.url));
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