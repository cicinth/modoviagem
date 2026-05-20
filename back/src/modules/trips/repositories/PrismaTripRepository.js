import { prisma } from "../../../config/prisma.js";
import { normalizeDiaryEntryInput, validateDiaryEntry } from "../models/diaryModel.js";
import {
  toAccommodationCreateMany,
  toChecklistCreateMany,
  toDocumentCreateMany,
  toImageLinkCreateMany,
  toTripPersistenceData,
  toTripResponse,
  tripRelations
} from "../mappers/tripMapper.js";

export class PrismaTripRepository {
  constructor(database = prisma) {
    this.database = database;
  }

  async findAll(userId) {
    const trips = await this.database.trip.findMany({
      where: { userId },
      include: tripRelations,
      orderBy: { updatedAt: "desc" }
    });

    return trips.map(toTripResponse);
  }

  async findById(id, userId) {
    const trip = await this.database.trip.findFirst({
      where: { id, userId },
      include: tripRelations
    });

    return trip ? toTripResponse(trip) : null;
  }

  async create(userId, trip) {
    const createdTrip = await this.database.trip.create({
      data: {
        userId,
        ...toTripPersistenceData(trip),
        imageLinks: { createMany: { data: toImageLinkCreateMany(trip.imageLinks) } },
        documents: { createMany: { data: toDocumentCreateMany(trip.documents) } },
        tasks: { createMany: { data: toChecklistCreateMany(trip.tasks) } },
        packingItems: { createMany: { data: toChecklistCreateMany(trip.packingList) } },
        accommodations: { createMany: { data: toAccommodationCreateMany(trip.accommodations) } }
      },
      include: tripRelations
    });

    return toTripResponse(createdTrip);
  }

  async update(id, userId, trip) {
    const exists = await this.database.trip.findFirst({ where: { id, userId }, select: { id: true } });

    if (!exists) {
      return null;
    }

    const updatedTrip = await this.database.$transaction(async (transaction) => {
      await transaction.tripImageLink.deleteMany({ where: { tripId: id } });
      await transaction.tripDocument.deleteMany({ where: { tripId: id } });
      await transaction.tripTask.deleteMany({ where: { tripId: id } });
      await transaction.tripPackingItem.deleteMany({ where: { tripId: id } });
      await transaction.tripAccommodation.deleteMany({ where: { tripId: id } });

      return transaction.trip.update({
        where: { id },
        data: {
          ...toTripPersistenceData(trip),
          imageLinks: { createMany: { data: toImageLinkCreateMany(trip.imageLinks) } },
          documents: { createMany: { data: toDocumentCreateMany(trip.documents) } },
          tasks: { createMany: { data: toChecklistCreateMany(trip.tasks) } },
          packingItems: { createMany: { data: toChecklistCreateMany(trip.packingList) } },
          accommodations: { createMany: { data: toAccommodationCreateMany(trip.accommodations) } }
        },
        include: tripRelations
      });
    });

    return toTripResponse(updatedTrip);
  }

  async delete(id, userId) {
    const exists = await this.database.trip.findFirst({ where: { id, userId }, select: { id: true } });

    if (!exists) {
      return false;
    }

    await this.database.trip.delete({ where: { id } });
    return true;
  }

  async findDiaryEntries(tripId, userId) {
    const trip = await this.findById(tripId, userId);
    return trip ? trip.diaryEntries || [] : null;
  }

  async createDiaryEntry(tripId, userId, entry) {
    const trip = await this.database.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });

    if (!trip) {
      return null;
    }

    const normalizedEntry = normalizeDiaryEntryInput(entry);
    validateDiaryEntry(normalizedEntry);

    const createdEntry = await this.database.tripDiaryEntry.create({
      data: {
        tripId,
        placeType: normalizedEntry.placeType,
        placeName: normalizedEntry.placeName,
        note: normalizedEntry.note,
        position: await this.nextDiaryPosition(tripId),
        ...(normalizedEntry.photos.length
          ? {
              photos: {
                createMany: {
                  data: normalizedEntry.photos.map((photo, position) => ({
                    url: photo.url,
                    caption: photo.caption,
                    position
                  }))
                }
              }
            }
          : {})
      },
      include: { photos: { orderBy: { position: "asc" } } }
    });

    return this.toDiaryResponse(createdEntry);
  }

  async updateDiaryEntry(tripId, userId, entryId, entry) {
    const trip = await this.database.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });

    if (!trip) {
      return null;
    }

    const existingEntry = await this.database.tripDiaryEntry.findFirst({
      where: { id: entryId, tripId },
      include: { photos: { orderBy: { position: "asc" } } }
    });

    if (!existingEntry) {
      return null;
    }

    const normalizedEntry = normalizeDiaryEntryInput(entry, existingEntry);
    validateDiaryEntry(normalizedEntry);

    const updatedEntry = await this.database.$transaction(async (transaction) => {
      await transaction.tripDiaryPhoto.deleteMany({ where: { diaryEntryId: entryId } });

      return transaction.tripDiaryEntry.update({
        where: { id: entryId },
        data: {
          placeType: normalizedEntry.placeType,
          placeName: normalizedEntry.placeName,
          note: normalizedEntry.note,
          ...(normalizedEntry.photos.length
            ? {
                photos: {
                  createMany: {
                    data: normalizedEntry.photos.map((photo, position) => ({
                      url: photo.url,
                      caption: photo.caption,
                      position
                    }))
                  }
                }
              }
            : {})
        },
        include: { photos: { orderBy: { position: "asc" } } }
      });
    });

    return this.toDiaryResponse(updatedEntry);
  }

  async deleteDiaryEntry(tripId, userId, entryId) {
    const trip = await this.database.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });

    if (!trip) {
      return false;
    }

    const existingEntry = await this.database.tripDiaryEntry.findFirst({
      where: { id: entryId, tripId },
      select: { id: true }
    });

    if (!existingEntry) {
      return false;
    }

    await this.database.tripDiaryEntry.delete({ where: { id: entryId } });
    return true;
  }

  async nextDiaryPosition(tripId) {
    const lastEntry = await this.database.tripDiaryEntry.findFirst({
      where: { tripId },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    return (lastEntry?.position ?? -1) + 1;
  }

  toDiaryResponse(entry) {
    return {
      id: entry.id,
      placeType: entry.placeType,
      placeName: entry.placeName,
      note: entry.note,
      position: entry.position,
      photos: entry.photos?.map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        position: photo.position,
        createdAt: photo.createdAt
      })) || [],
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };
  }
}
