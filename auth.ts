import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const pool = new Pool({ connectionString });
  return {
    adapter: NeonAdapter(pool),
    providers: [Google],
    pages: { signIn: "/login" },
    session: { strategy: "database" },
    callbacks: {
      async signIn({ profile }) { return profile?.email_verified === true; },
      async session({ session, user }) {
        if (session.user) session.user.id = String(user.id);
        return session;
      },
    },
    trustHost: true,
  };
});
