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

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        if (email !== adminEmail || password !== adminPassword) {
          return null;
        }

        let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        if (!admin) {
          admin = await prisma.user.create({
            data: { email: adminEmail, name: "Admin", password: hashedPassword },
          });
          return admin;
        }

        const storedMatchesEnv =
          !!admin.password && (await bcrypt.compare(adminPassword, admin.password));

        if (!storedMatchesEnv) {
          admin = await prisma.user.update({
            where: { id: admin.id },
            data: { password: hashedPassword, email: adminEmail },
          });
        }

        return admin;
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
