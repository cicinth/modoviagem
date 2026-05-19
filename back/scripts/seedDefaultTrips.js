import "dotenv/config";
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
const demoUserEmail = "demo@viajario.local";
const demoUserPassword = "viajario123";

async function main() {
  const defaultTrips = await loadTripsFromFile(defaultTripsFile, readFile);
  const demoUser = await ensureDemoUser();
  await prisma.trip.updateMany({
    where: { userId: null },
    data: { userId: demoUser.id }
  });

  const result = await seedTrips(defaultTrips, prisma, demoUser.id);

  console.log(
    `Seed concluido. Criadas: ${result.created}. Hidratadas: ${result.hydrated}. Ignoradas: ${result.skipped}.`
  );
}

async function ensureDemoUser() {
  const existingUser = await prisma.user.findUnique({ where: { email: demoUserEmail } });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Demo Viajário",
      email: demoUserEmail,
      passwordHash: hashPassword(demoUserPassword)
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
