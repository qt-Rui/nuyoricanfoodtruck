import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // Check if this is the admin email from env
        if (email === process.env.ADMIN_EMAIL?.toLowerCase()) {
          let admin = await prisma.user.findUnique({ where: { email } });

          // If admin doesn't exist, create it with hashed password
          if (!admin) {
            const hashedPassword = await bcrypt.hash(
              process.env.ADMIN_PASSWORD!,
              10
            );
            admin = await prisma.user.create({
              data: { email, name: "Admin", password: hashedPassword },
            });
          }

          // Compare given password with stored hashed one
          const isValid = await bcrypt.compare(password, admin.password ?? "");
          if (isValid) return admin;
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});