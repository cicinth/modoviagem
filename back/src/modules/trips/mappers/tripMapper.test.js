import { describe, expect, it } from "vitest";
import { toAccommodationCreateMany, toTripPersistenceData } from "./tripMapper.js";

describe("tripMapper", () => {
  it("nao inclui userId no payload persistido da viagem", () => {
    const data = toTripPersistenceData({
      userId: null,
      name: "Portugal",
      destination: "Lisboa"
    });

    expect(data).toMatchObject({
      name: "Portugal",
      destination: "Lisboa"
    });
    expect(data).not.toHaveProperty("userId");
  });

  it("mapeia timestamps de hospedagem para createMany", () => {
    expect(toAccommodationCreateMany([{
      destination: "Lisboa",
      name: "Hotel Centro",
      dates: "02/04/2026 15:00 a 05/04/2026 11:00",
      checkInAt: new Date("2026-04-02T15:00:00.000Z"),
      checkOutAt: new Date("2026-04-05T11:00:00.000Z"),
      link: "https://hotel.example.com",
      address: "Rua 1"
    }])).toEqual([{
      destination: "Lisboa",
      name: "Hotel Centro",
      dates: "02/04/2026 15:00 a 05/04/2026 11:00",
      checkInAt: new Date("2026-04-02T15:00:00.000Z"),
      checkOutAt: new Date("2026-04-05T11:00:00.000Z"),
      link: "https://hotel.example.com",
      address: "Rua 1",
      position: 0
    }]);
  });
});
