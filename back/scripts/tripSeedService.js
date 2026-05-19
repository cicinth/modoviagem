import {
  toChecklistCreateMany,
  toDocumentCreateMany,
  toImageLinkCreateMany,
  toTripPersistenceData
} from "../src/modules/trips/mappers/tripMapper.js";
import { normalizeTripInput, validateTrip } from "../src/modules/trips/models/tripModel.js";

export async function loadTripsFromFile(filePath, readFile) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content || "[]");
}

export async function seedTrips(rawTrips, database, defaultUserId = null) {
  let created = 0;
  let skipped = 0;
  let hydrated = 0;

  for (const rawTrip of rawTrips) {
    const exists = await database.trip.findUnique({
      where: { id: rawTrip.id },
      select: { id: true, itineraryMarkdown: true }
    });

    if (exists) {
      if (shouldHydrateDefaultTrip(exists)) {
        await hydrateDefaultTrip(rawTrip, database, defaultUserId);
        hydrated += 1;
        continue;
      }

      skipped += 1;
      continue;
    }

    await createTripFromSeed(rawTrip, database, defaultUserId);

    created += 1;
  }

  return { created, skipped, hydrated };
}

function shouldHydrateDefaultTrip(existingTrip) {
  return existingTrip.itineraryMarkdown === "# China & Alemanha - Novembro 2026";
}

async function createTripFromSeed(rawTrip, database, defaultUserId) {
  const trip = normalizeTripInput(rawTrip);
  validateTrip(trip);

  await database.trip.create({
    data: {
      id: rawTrip.id,
      userId: rawTrip.userId ?? defaultUserId ?? null,
      ...toTripPersistenceData(trip),
      createdAt: rawTrip.createdAt ? new Date(rawTrip.createdAt) : undefined,
      updatedAt: rawTrip.updatedAt ? new Date(rawTrip.updatedAt) : undefined,
      imageLinks: { createMany: { data: toImageLinkCreateMany(trip.imageLinks) } },
      documents: { createMany: { data: toDocumentCreateMany(trip.documents) } },
      tasks: { createMany: { data: toChecklistCreateMany(trip.tasks) } },
      packingItems: { createMany: { data: toChecklistCreateMany(trip.packingList) } }
    }
  });
}

async function hydrateDefaultTrip(rawTrip, database, defaultUserId) {
  const trip = normalizeTripInput(rawTrip);
  validateTrip(trip);

  await database.$transaction(async (transaction) => {
    await transaction.tripImageLink.deleteMany({ where: { tripId: rawTrip.id } });
    await transaction.tripDocument.deleteMany({ where: { tripId: rawTrip.id } });
    await transaction.tripTask.deleteMany({ where: { tripId: rawTrip.id } });
    await transaction.tripPackingItem.deleteMany({ where: { tripId: rawTrip.id } });

    await transaction.trip.update({
      where: { id: rawTrip.id },
      data: {
        userId: rawTrip.userId ?? defaultUserId ?? null,
        ...toTripPersistenceData(trip),
        createdAt: rawTrip.createdAt ? new Date(rawTrip.createdAt) : undefined,
        updatedAt: rawTrip.updatedAt ? new Date(rawTrip.updatedAt) : undefined,
        imageLinks: { createMany: { data: toImageLinkCreateMany(trip.imageLinks) } },
        documents: { createMany: { data: toDocumentCreateMany(trip.documents) } },
        tasks: { createMany: { data: toChecklistCreateMany(trip.tasks) } },
        packingItems: { createMany: { data: toChecklistCreateMany(trip.packingList) } }
      }
    });
  });
}
