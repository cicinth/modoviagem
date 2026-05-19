import { describe, expect, it } from "vitest";
import { loadTripsFromFile, seedTrips } from "./tripSeedService.js";

function createDatabase(existingIds = []) {
  const createdTrips = [];
  const updatedTrips = [];

  return {
    createdTrips,
    updatedTrips,
    async $transaction(callback) {
      return callback(this);
    },
    trip: {
      async findUnique({ where }) {
        const existing = existingIds.find((item) => item.id === where.id || item === where.id);
        return existing ? { id: where.id, itineraryMarkdown: existing.itineraryMarkdown || "" } : null;
      },
      async create({ data }) {
        createdTrips.push(data);
        return data;
      },
      async update({ data }) {
        updatedTrips.push(data);
        return data;
      }
    },
    tripImageLink: {
      async deleteMany() {}
    },
    tripDocument: {
      async deleteMany() {}
    },
    tripTask: {
      async deleteMany() {}
    },
    tripPackingItem: {
      async deleteMany() {}
    }
  };
}

describe("tripSeedService", () => {
  it("carrega viagens de arquivo json", async () => {
    const trips = await loadTripsFromFile("defaultTrips.json", async () => '[{"id":"1","name":"China"}]');

    expect(trips).toEqual([{ id: "1", name: "China" }]);
  });

  it("cria viagens inexistentes e ignora viagens ja cadastradas", async () => {
    const database = createDatabase(["trip-1"]);

    const result = await seedTrips(
      [
        { id: "trip-1", name: "China" },
        { id: "trip-2", name: "Alemanha", tasks: "Comprar passagem" }
      ],
      database
    );

    expect(result).toEqual({ created: 1, skipped: 1, hydrated: 0 });
    expect(database.createdTrips).toHaveLength(1);
    expect(database.createdTrips[0]).toMatchObject({
      id: "trip-2",
      name: "Alemanha",
      tasks: { createMany: { data: [{ text: "Comprar passagem", done: false, position: 0 }] } }
    });
  });

  it("hidrata viagem default minima sem duplicar", async () => {
    const database = createDatabase([
      { id: "trip-1", itineraryMarkdown: "# China & Alemanha - Novembro 2026" }
    ]);

    const result = await seedTrips(
      [
        {
          id: "trip-1",
          name: "China e Alemanha 2026",
          itineraryMarkdown: "# Roteiro completo",
          packingList: ["Passaporte"]
        }
      ],
      database
    );

    expect(result).toEqual({ created: 0, skipped: 0, hydrated: 1 });
    expect(database.updatedTrips).toHaveLength(1);
    expect(database.updatedTrips[0]).toMatchObject({
      name: "China e Alemanha 2026",
      itineraryMarkdown: "# Roteiro completo"
    });
  });
});
