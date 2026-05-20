import { describe, expect, it } from "vitest";
import { normalizeDiaryEntryInput, normalizeDiaryPhotos, validateDiaryEntry } from "./diaryModel.js";

describe("diaryModel", () => {
  it("normalizes photo links and captions", () => {
    expect(
      normalizeDiaryPhotos([
        "https://example.com/photo.jpg",
        { url: "https://example.com/photo-2.jpg", caption: "Noite" }
      ])
    ).toEqual([
      { url: "https://example.com/photo.jpg", caption: "" },
      { url: "https://example.com/photo-2.jpg", caption: "Noite" }
    ]);
  });

  it("normalizes diary entries", () => {
    expect(
      normalizeDiaryEntryInput({
        placeType: " cidade ",
        placeName: " Lisboa ",
        note: "  Café e caminhada  ",
        photos: ["https://example.com/a.jpg", { url: "https://example.com/b.jpg", caption: "Vista" }]
      })
    ).toEqual({
      placeType: "cidade",
      placeName: "Lisboa",
      note: "Café e caminhada",
      photos: [
        { url: "https://example.com/a.jpg", caption: "" },
        { url: "https://example.com/b.jpg", caption: "Vista" }
      ]
    });
  });

  it("requires place type and place name", () => {
    expect(() => validateDiaryEntry({ placeType: "", placeName: "Lisboa" })).toThrow();
    expect(() => validateDiaryEntry({ placeType: "cidade", placeName: "" })).toThrow();
  });

  it("rejects invalid place types and unsafe photo urls", () => {
    expect(() => validateDiaryEntry({ placeType: "hotel", placeName: "Lisboa", note: "", photos: [] })).toThrow();
    expect(() => validateDiaryEntry({
      placeType: "cidade",
      placeName: "Lisboa",
      note: "",
      photos: [{ url: "javascript:alert(1)", caption: "" }]
    })).toThrow();
  });
});
