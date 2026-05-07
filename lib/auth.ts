import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { authenticator } from "otplib";
import { Resend } from "resend";
import { generateUserId } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject: `Sign in to onlyaff.io`,
            html: `
              <div style="background: #050505; color: #fff; padding: 40px; font-family: sans-serif; border-radius: 20px; max-width: 500px; margin: auto; border: 1px solid rgba(255,255,255,0.1);">
                <div style="width: 40px; height: 40px; background: #BEFF00; border-radius: 10px; margin-bottom: 24px;"></div>
                <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">Sign in to onlyaff.io</h1>
                <p style="color: #666; font-size: 14px; line-height: 24px; margin-bottom: 32px;">Click the button below to securely sign in to your account. This link will expire in 24 hours.</p>
                <a href="${url}" style="background: #BEFF00; color: #000; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">Log In to Dashboard</a>
                <p style="color: #444; font-size: 12px; margin-top: 32px;">If you did not request this email, you can safely ignore it.</p>
              </div>
            `
          });
        } catch (error) {
          console.error("Resend error:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_USER_EMAIL;
        const adminPassword = process.env.ADMIN_USER_PASSWORD;
        const adminSecret = process.env.ADMIN_2FA_SECRET;
        const is2FAEnabled = process.env.ENABLE_ADMIN_2FA === "true";

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          // If 2FA is enabled, verify the code
          if (is2FAEnabled) {
            if (!credentials?.code) throw new Error("2FA_REQUIRED");
            const isValid = authenticator.verify({
              token: credentials.code,
              secret: adminSecret || "",
            });
            if (!isValid) throw new Error("INVALID_2FA");
          }

          return {
            id: "admin",
            name: "Administrator",
            email: adminEmail,
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // Assign a unique 6-char ID to new users
      await prisma.user.update({
        where: { id: user.id },
        data: { userId: generateUserId() }
      });
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.userId = (user as any).userId;
      }
      
      // If userId is not in token yet (first login), fetch it
      if (!token.userId && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.userId = dbUser.userId;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
};
