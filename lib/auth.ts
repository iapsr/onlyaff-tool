import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { authenticator } from "@otplib/preset-default";
import { Resend } from "resend";
import { generateUserId } from "./utils";
import { magicLinkTemplate } from "./email-templates";

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
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject: `Sign in to onlyaff.io`,
            html: magicLinkTemplate(url)
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
