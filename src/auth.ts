import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { type: "email", label: "Email", placeholder: "example@gmail.com" },
                password: { label: "Password", type: "password", placeholder: "******" },
            },
            async authorize(credentials, request) {
                if (!credentials.email || !credentials.password) {
                    throw Error("Missing credentials");
                }
                const email = credentials.email;
                const password = credentials.password as string;
                await connectDb();
                const user = await User.findOne({ email });
                if (!user) {
                    throw Error("User doesn't exist!");
                }
                const isMatched = await bcrypt.compare(password, user.password);
                if (!isMatched) {
                    throw Error("Incorrect Password");
                }
                return {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                };
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            token.name = user.name,
                token.id = user.id,
                token.email = user.email,
                token.role = user.role
        }
    }
})