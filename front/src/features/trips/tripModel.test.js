import { describe, expect, it } from "vitest";
import { normalizeChecklist, toDateTimeInputValue, toFormState, toPayload } from "./tripModel.js";

describe("tripModel", () => {
  it("converts API trip arrays into editable text fields", () => {
    const form = toFormState({
      name: "China 2026",
      imageLinks: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
      documents: ["Passaporte", "Visto"],
      tasks: [{ text: "Comprar passagem", done: false }],
      packingList: [{ text: "Casaco", done: true }]
    });

    expect(form.imageLinksText).toBe("https://example.com/a.jpg\nhttps://example.com/b.jpg");
    expect(form.documentsText).toBe("Passaporte\nVisto");
    expect(form.tasksText).toBe("Comprar passagem");
    expect(form.packingListText).toBe("Casaco");
  });

  it("converts editable text fields into API payload arrays", () => {
    const payload = toPayload({
      name: "Rio",
      imageLinksText: "https://example.com/a.jpg\n\nhttps://example.com/b.jpg",
      documentsText: "RG\nPassaporte",
      tasksText: "Comprar passagem\nReservar hotel",
      packingListText: "Carregador\nTênis"
    });

    expect(payload.imageLinks).toEqual(["https://example.com/a.jpg", "https://example.com/b.jpg"]);
    expect(payload.documents).toEqual(["RG", "Passaporte"]);
    expect(payload.tasks).toEqual([
      { text: "Comprar passagem", done: false },
      { text: "Reservar hotel", done: false }
    ]);
    expect(payload.packingList).toEqual([
      { text: "Carregador", done: false },
      { text: "Tênis", done: false }
    ]);
  });

  it("normalizes legacy string checklist items", () => {
    expect(normalizeChecklist(["Passaporte", { text: "Seguro", done: true }])).toEqual([
      { text: "Passaporte", done: false },
      { text: "Seguro", done: true }
    ]);
  });

  it("converts accommodation timestamps between API and payload", () => {
    const form = toFormState({
      name: "Portugal",
      accommodations: [{
        destination: "Lisboa",
        name: "Hotel Centro",
        checkInAt: "2026-04-02T15:00",
        checkOutAt: "2026-04-05T11:00"
      }]
    });

    expect(form.accommodations[0]).toMatchObject({
      checkInAt: "2026-04-02T15:00",
      checkOutAt: "2026-04-05T11:00"
    });

    const payload = toPayload({
      ...form,
      imageLinksText: "",
      documentsText: "",
      tasksText: "",
      packingListText: ""
    });

    expect(payload.accommodations[0]).toMatchObject({
      checkInAt: "2026-04-02T15:00",
      checkOutAt: "2026-04-05T11:00"
    });
  });

  it("returns empty value for invalid datetime input", () => {
    expect(toDateTimeInputValue("invalid")).toBe("");
  });
});
