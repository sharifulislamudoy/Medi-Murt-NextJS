import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("User not found");
                }

                // ❌ Prevent login if not approved
                if (user.status !== "APPROVED") {
                    throw new Error("Your account is not approved by admin");
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // First time login → attach id & role
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }

            // 🔥 ALWAYS re-check status from DB
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { status: true },
                });

                // If user no longer approved → invalidate token
                if (!dbUser || dbUser.status !== "APPROVED") {
                    return {}; // This clears the token
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (!token?.id) {
                return null as any; // Session becomes null
            }

            if (session.user) {
                session.user.role = token.role as any;
                session.user.id = token.id as string;
            }

            return session;
        }
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
};