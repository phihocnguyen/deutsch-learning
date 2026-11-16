import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const pool = new Pool({ connectionString });
  const adapter = NeonAdapter(pool);
  return {
    adapter: {
      ...adapter,
      async getSessionAndUser(token) {
        const result = await adapter.getSessionAndUser!(token);
        if (result && "disabled" in result.user && result.user.disabled === true) return null;
        return result;
      },
    },
    providers: [Google],
    pages: { signIn: "/login" },
    session: { strategy: "database" },
    callbacks: {
      async signIn({ profile }) {
        if (profile?.email_verified !== true || typeof profile.email !== "string") return false;
        const result = await pool.query("SELECT disabled FROM users WHERE lower(email)=lower($1)", [profile.email]);
        return result.rows.every(user => !user.disabled);
      },
      async session({ session, user }) {
        if (session.user) session.user.id = String(user.id);
        return session;
      },
    },
    trustHost: true,
  };
});
