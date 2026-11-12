import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  // Imported after env is loaded, because db reads DATABASE_URL on import.
  const { auth } = await import("../lib/auth");

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local");
  }

  await auth.api.createUser({
    body: { email, password, name, role: "superadmin" },
  });
  console.log(`Super Admin created: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});