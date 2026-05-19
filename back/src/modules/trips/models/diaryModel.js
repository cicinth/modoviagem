import { AppError } from "../../../shared/errors/AppError.js";

function asText(value) {
  return String(value || "").trim();
}

export function normalizeDiaryPhotos(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { url: item.trim(), caption: "" };
      }

      return {
        url: asText(item?.url),
        caption: asText(item?.caption)
      };
    })
    .filter((item) => item.url);
}

export function normalizeDiaryEntryInput(input = {}, existing = null) {
  const fallback = existing || {};

  return {
    placeType: asText(input.placeType ?? fallback.placeType),
    placeName: asText(input.placeName ?? fallback.placeName),
    note: asText(input.note ?? fallback.note),
    photos: normalizeDiaryPhotos(input.photos ?? fallback.photos)
  };
}

export function validateDiaryEntry(entry) {
  if (!entry.placeType) {
    throw new AppError("Informe o tipo de lugar", 400);
  }

  if (!entry.placeName) {
    throw new AppError("Informe o nome do lugar", 400);
  }
}
