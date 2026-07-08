import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";

class UserNotFoundError extends CredentialsSignin {
    code = "user_not_found"
}

class IncorrectPasswordError extends CredentialsSignin {
    code = "incorrect_password"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { type: "email", label: "Email", placeholder: "example@gmail.com" },
                password: { label: "Password", type: "password", placeholder: "******" },
            },
            async authorize(credentials, request) {
                if (!credentials.email || !credentials.password) {
                    throw new CredentialsSignin("Missing credentials");
                }
                const email = credentials.email;
                const password = credentials.password as string;
                await connectDb();
                const user = await User.findOne({ email });
                if (!user) {
                    throw new UserNotFoundError();
                }
                const isMatched = await bcrypt.compare(password, user.password);
                if (!isMatched) {
                    throw new IncorrectPasswordError();
                }
                return {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                };
            }
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        })
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDb();
                let dbuser = await User.findOne({ email: user.email });
                if (!dbuser) {
                    dbuser = await User.create({
                        name: user.name,
                        email: user.email,
                    })
                }
                user.id = dbuser._id
                user.role = dbuser.role
            }
            return true;
        }
    }
})