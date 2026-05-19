import { beforeEach, describe, expect, it } from "vitest";
import { AppError } from "../../../shared/errors/AppError.js";
import { TRIP_STATUSES } from "../models/tripModel.js";
import { TripService } from "./TripService.js";

function createMemoryRepository() {
  const trips = new Map();

  return {
    async findAll(userId) {
      return [...trips.values()].filter((trip) => trip.userId === userId);
    },
    async findById(id, userId) {
      const trip = trips.get(id) || null;
      return trip && trip.userId === userId ? trip : null;
    },
    async create(userId, trip) {
      const created = {
        id: `trip-${trips.size + 1}`,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        ...trip,
        userId
      };

      trips.set(created.id, created);
      return created;
    },
    async update(id, userId, trip) {
      if (!trips.has(id)) {
        return null;
      }

      const current = trips.get(id);
      if (current.userId !== userId) {
        return null;
      }

      const updated = {
        ...current,
        ...trip,
        updatedAt: new Date("2026-01-02T00:00:00.000Z")
      };

      trips.set(id, updated);
      return updated;
    },
    async delete(id, userId) {
      const current = trips.get(id);

      if (!current || current.userId !== userId) {
        return false;
      }

      return trips.delete(id);
    }
  };
}

describe("TripService", () => {
  let service;

  beforeEach(() => {
    service = new TripService(createMemoryRepository());
  });

  it("cria viagem normalizada", async () => {
    const trip = await service.createTrip("user-1", {
      name: " China ",
      tasks: "Comprar passagens\nReservar hotel"
    });

    expect(trip).toMatchObject({
      id: "trip-1",
      name: "China",
      status: TRIP_STATUSES.NEXT,
      tasks: [
        { text: "Comprar passagens", done: false },
        { text: "Reservar hotel", done: false }
      ]
    });
  });

  it("nao cria viagem sem nome", async () => {
    await expect(service.createTrip("user-1", { name: "" })).rejects.toThrow(AppError);
  });

  it("atualiza viagem preservando campos existentes", async () => {
    const created = await service.createTrip("user-1", {
      name: "China",
      destination: "Pequim"
    });

    const updated = await service.updateTrip(created.id, "user-1", { period: "Novembro 2026" });

    expect(updated).toMatchObject({
      name: "China",
      destination: "Pequim",
      period: "Novembro 2026"
    });
  });

  it("finaliza viagem existente", async () => {
    const created = await service.createTrip("user-1", { name: "Alemanha" });
    const finalized = await service.finalizeTrip(created.id, "user-1");

    expect(finalized.status).toBe(TRIP_STATUSES.FINISHED);
  });

  it("retorna null ao atualizar viagem inexistente", async () => {
    await expect(service.updateTrip("missing", "user-1", { name: "Nova" })).resolves.toBeNull();
  });

  it("remove viagem existente", async () => {
    const created = await service.createTrip("user-1", { name: "Italia" });

    await expect(service.deleteTrip(created.id, "user-1")).resolves.toBe(true);
    await expect(service.getTripById(created.id, "user-1")).resolves.toBeNull();
  });
});
