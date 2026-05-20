import "dotenv/config";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/modules/auth/authUtils.js";
import {
  loadTripsFromFile,
  seedTrips
} from "./tripSeedService.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultTripsFile = path.resolve(currentDir, "../prisma/seed/defaultTrips.json");
const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || "demo@viajario.local";
const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || crypto.randomUUID();

async function main() {
  const defaultTrips = await loadTripsFromFile(defaultTripsFile, readFile);
  const defaultUser = await ensureDefaultUser();
  await prisma.trip.updateMany({
    where: { userId: null },
    data: { userId: defaultUser.id }
  });

  const result = await seedTrips(defaultTrips, prisma, defaultUser.id);

  console.log(
    `Seed concluido. Criadas: ${result.created}. Hidratadas: ${result.hydrated}. Ignoradas: ${result.skipped}.`
  );
}

async function ensureDefaultUser() {
  const existingUser = await prisma.user.findUnique({ where: { email: defaultUserEmail } });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Cinthia Cardoso",
      email: defaultUserEmail,
      passwordHash: hashPassword(defaultUserPassword)
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
