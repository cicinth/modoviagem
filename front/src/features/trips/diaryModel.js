export const diaryPlaceTypes = {
  CITY: "cidade",
  COUNTRY: "pais"
};

export const diaryEntryDefaults = {
  placeType: diaryPlaceTypes.CITY,
  placeName: "",
  note: "",
  photosText: ""
};

function normalizeLine(value) {
  return String(value || "").trim();
}

export function listToPhotosText(photos) {
  return Array.isArray(photos)
    ? photos
        .map((photo) => {
          const url = normalizeLine(photo?.url);
          const caption = normalizeLine(photo?.caption);
          return caption ? `${url} | ${caption}` : url;
        })
        .filter(Boolean)
        .join("\n")
    : "";
}

export function textToPhotos(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, ...captionParts] = line.split("|").map((part) => part.trim());
      return {
        url,
        caption: captionParts.join(" | ")
      };
    })
    .filter((item) => item.url);
}

export function toDiaryForm(entry = null) {
  return {
    ...diaryEntryDefaults,
    ...(entry || {}),
    photosText: listToPhotosText(entry?.photos || [])
  };
}

export function toDiaryPayload(form) {
  return {
    placeType: form.placeType,
    placeName: form.placeName,
    note: form.note,
    photos: textToPhotos(form.photosText)
  };
}
