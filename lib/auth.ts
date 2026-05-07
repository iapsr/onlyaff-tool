import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // LinkedInProvider({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    //   authorization: { params: { scope: "openid profile email" } },
    // }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
        "2fa": { label: "2FA PIN", type: "text", placeholder: "Enter Admin PIN" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_USER_EMAIL;
        const adminPassword = process.env.ADMIN_USER_PASSWORD;
        const admin2FA = process.env.ADMIN_USER_2FA;

        console.log('Login attempt for:', credentials?.email);
        console.log('Admin Email in Env:', adminEmail ? 'SET' : 'MISSING');
        console.log('Admin Pass in Env:', adminPassword ? 'SET' : 'MISSING');
        console.log('Admin 2FA in Env:', admin2FA ? 'SET' : 'MISSING');

        if (
          credentials?.email === adminEmail && 
          credentials?.password === adminPassword &&
          credentials?.["2fa"] === admin2FA
        ) {
          console.log('Login successful for:', adminEmail);
          return {
            id: "admin",
            name: "Administrator",
            email: adminEmail,
            role: "admin",
          };
        }
        
        console.log('Login failed: Credentials do not match');
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.user.provider = token.provider;
      // @ts-ignore
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/api/auth/signin', 
  },
  debug: true,
};
