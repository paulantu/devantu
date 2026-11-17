import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";
import { ac, roles } from "./permissions";
import { admin, twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },
    plugins: [
    admin({
      ac,
      roles,
      defaultRole: "author",
      adminRoles: ["superadmin", "admin"],
    }),
    twoFactor({ issuer: "Antu" }),
    nextCookies(), // keep last
  ],
});