import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/config/prisma.js";
import {
  loadTripsFromFile,
  seedTrips
} from "./tripSeedService.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const legacyFile = path.resolve(currentDir, "../data/trips.txt");

async function main() {
  const legacyTrips = await loadTripsFromFile(legacyFile, readFile);
  const result = await seedTrips(legacyTrips, prisma);

  console.log(
    `Importacao concluida. Importadas: ${result.created}. Hidratadas: ${result.hydrated}. Ignoradas: ${result.skipped}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
