import { AppError } from "../../../shared/errors/AppError.js";

function asText(value) {
  return String(value || "").trim();
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
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
    .filter((item) => item.url)
    .slice(0, 30);
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

  if (!["cidade", "pais"].includes(entry.placeType)) {
    throw new AppError("Informe um tipo de lugar válido", 400);
  }

  if (entry.placeName.length > 160) {
    throw new AppError("Nome do lugar muito longo", 400);
  }

  if (entry.note.length > 5000) {
    throw new AppError("Nota muito longa", 400);
  }

  const invalidPhoto = entry.photos.find((photo) => !isHttpUrl(photo.url) || photo.url.length > 2048 || photo.caption.length > 300);
  if (invalidPhoto) {
    throw new AppError("Informe links de fotos válidos", 400);
  }
}
