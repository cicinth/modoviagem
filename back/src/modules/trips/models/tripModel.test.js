import { describe, expect, it } from "vitest";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  asChecklist,
  asList,
  defaultPackingList,
  normalizeTripInput,
  TRIP_STATUSES,
  validateTrip
} from "./tripModel.js";

describe("tripModel", () => {
  it("normaliza strings multiline em listas", () => {
    expect(asList(" passaporte \n\n reserva ")).toEqual(["passaporte", "reserva"]);
  });

  it("normaliza checklist a partir de strings e objetos", () => {
    expect(asChecklist(["Comprar passagem", { text: "Reservar hotel", done: true }, { text: "" }])).toEqual([
      { text: "Comprar passagem", done: false },
      { text: "Reservar hotel", done: true }
    ]);
  });

  it("aplica valores padrao para uma nova viagem", () => {
    const trip = normalizeTripInput({ name: " Alemanha " });

    expect(trip).toMatchObject({
      name: "Alemanha",
      status: TRIP_STATUSES.NEXT,
      hasInsurance: false,
      transportType: "",
      accommodations: [],
      packingList: defaultPackingList
    });
  });

  it("preserva campos existentes durante atualizacao parcial", () => {
    const trip = normalizeTripInput(
      { status: TRIP_STATUSES.FINISHED },
      {
        name: "China",
        destination: "Pequim",
        tasks: [{ text: "Visto", done: false }]
      }
    );

    expect(trip).toMatchObject({
      name: "China",
      destination: "Pequim",
      status: TRIP_STATUSES.FINISHED,
      tasks: [{ text: "Visto", done: false }]
    });
  });

  it("rejeita viagem sem nome", () => {
    expect(() => validateTrip(normalizeTripInput({ name: " " }))).toThrow(AppError);
  });

  it("rejeita links invalidos e campos grandes", () => {
    expect(() => validateTrip(normalizeTripInput({ name: "Teste", imageLinks: ["javascript:alert(1)"] }))).toThrow(AppError);
    expect(() => validateTrip(normalizeTripInput({ name: "x".repeat(170) }))).toThrow(AppError);
  });

  it("normaliza hospedagens e tipo de transporte", () => {
    const trip = normalizeTripInput({
      name: "Portugal",
      transportType: "aviao",
      accommodations: [{ destination: "Lisboa", name: "Hotel Centro", link: "https://hotel.example.com" }]
    });

    expect(trip.transportType).toBe("aviao");
    expect(trip.accommodations).toEqual([
      {
        destination: "Lisboa",
        name: "Hotel Centro",
        dates: "",
        checkInAt: null,
        checkOutAt: null,
        link: "https://hotel.example.com",
        address: ""
      }
    ]);
  });

  it("normaliza timestamps de check-in e check-out da hospedagem", () => {
    const trip = normalizeTripInput({
      name: "Portugal",
      accommodations: [{
        destination: "Lisboa",
        name: "Hotel Centro",
        checkInAt: "2026-04-02T15:00",
        checkOutAt: "2026-04-05T11:00"
      }]
    });

    expect(trip.accommodations[0]).toMatchObject({
      destination: "Lisboa",
      name: "Hotel Centro",
      dates: "02/04/2026 15:00 a 05/04/2026 11:00",
      checkInAt: new Date("2026-04-02T15:00"),
      checkOutAt: new Date("2026-04-05T11:00")
    });
  });

  it("rejeita check-out anterior ao check-in", () => {
    const trip = normalizeTripInput({
      name: "Portugal",
      accommodations: [{
        name: "Hotel Centro",
        checkInAt: "2026-04-05T15:00",
        checkOutAt: "2026-04-02T11:00"
      }]
    });

    expect(() => validateTrip(trip)).toThrow(AppError);
  });

  it("normaliza datas de ida e volta e gera periodo legado", () => {
    const trip = normalizeTripInput({
      name: "Portugal",
      departureDate: "2026-04-02",
      returnDate: "2026-04-05"
    });

    expect(trip.departureDate).toEqual(new Date("2026-04-02T00:00:00.000Z"));
    expect(trip.returnDate).toEqual(new Date("2026-04-05T00:00:00.000Z"));
    expect(trip.period).toBe("02/04/2026 a 05/04/2026");
  });

  it("rejeita data de volta anterior a ida", () => {
    const trip = normalizeTripInput({
      name: "Portugal",
      departureDate: "2026-04-05",
      returnDate: "2026-04-02"
    });

    expect(() => validateTrip(trip)).toThrow(AppError);
  });

  it("recalcula periodo quando datas mudam em atualizacao parcial", () => {
    const trip = normalizeTripInput(
      { departureDate: "2026-05-10", returnDate: "2026-05-20" },
      { name: "Portugal", period: "Abril antigo" }
    );

    expect(trip.period).toBe("10/05/2026 a 20/05/2026");
  });
});
