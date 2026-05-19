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
});
