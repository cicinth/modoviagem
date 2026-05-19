export const tripRelations = {
  imageLinks: { orderBy: { position: "asc" } },
  documents: { orderBy: { position: "asc" } },
  tasks: { orderBy: { position: "asc" } },
  packingItems: { orderBy: { position: "asc" } },
  diaryEntries: {
    orderBy: { position: "asc" },
    include: {
      photos: { orderBy: { position: "asc" } }
    }
  }
};

export function toTripResponse(trip) {
  return {
    id: trip.id,
    userId: trip.userId,
    name: trip.name,
    destination: trip.destination,
    period: trip.period,
    status: trip.status,
    imageLinks: trip.imageLinks?.map((item) => item.url) || [],
    documents: trip.documents?.map((item) => item.title) || [],
    tasks: trip.tasks?.map(toChecklistResponse) || [],
    packingList: trip.packingItems?.map(toChecklistResponse) || [],
    hasInsurance: trip.hasInsurance,
    insuranceTicket: trip.insuranceTicket,
    transport: trip.transport,
    reservationCode: trip.reservationCode,
    locator: trip.locator,
    accommodation: trip.accommodation,
    accommodationDates: trip.accommodationDates,
    accommodationLink: trip.accommodationLink,
    accommodationAddress: trip.accommodationAddress,
    accommodationDirections: trip.accommodationDirections,
    internalTransport: trip.internalTransport,
    itineraryMarkdown: trip.itineraryMarkdown,
    diaryEntries: trip.diaryEntries?.map(toDiaryEntryResponse) || [],
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  };
}

function toChecklistResponse(item) {
  return {
    text: item.text,
    done: item.done
  };
}

function toDiaryEntryResponse(entry) {
  return {
    id: entry.id,
    placeType: entry.placeType,
    placeName: entry.placeName,
    note: entry.note,
    position: entry.position,
    photos: entry.photos?.map(toDiaryPhotoResponse) || [],
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

function toDiaryPhotoResponse(photo) {
  return {
    id: photo.id,
    url: photo.url,
    caption: photo.caption,
    position: photo.position,
    createdAt: photo.createdAt
  };
}

export function toTripPersistenceData(trip) {
  return {
    userId: trip.userId,
    name: trip.name,
    destination: trip.destination,
    period: trip.period,
    status: trip.status,
    hasInsurance: trip.hasInsurance,
    insuranceTicket: trip.insuranceTicket,
    transport: trip.transport,
    reservationCode: trip.reservationCode,
    locator: trip.locator,
    accommodation: trip.accommodation,
    accommodationDates: trip.accommodationDates,
    accommodationLink: trip.accommodationLink,
    accommodationAddress: trip.accommodationAddress,
    accommodationDirections: trip.accommodationDirections,
    internalTransport: trip.internalTransport,
    itineraryMarkdown: trip.itineraryMarkdown
  };
}

export function toImageLinkCreateMany(imageLinks) {
  return imageLinks.map((url, position) => ({ url, position }));
}

export function toDocumentCreateMany(documents) {
  return documents.map((title, position) => ({ title, position }));
}

export function toChecklistCreateMany(items) {
  return items.map((item, position) => ({
    text: item.text,
    done: item.done,
    position
  }));
}
