import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name;
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ token, session }) {
            if (session.user) {
                session.user.name = token.name;
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/signin",
        error: "/signin"
    },
    session: {
        maxAge: 10 * 24 * 60 * 60,
        strategy: "jwt"
    },
    secret: process.env.AUTH_SECRET
} satisfies NextAuthConfig;
