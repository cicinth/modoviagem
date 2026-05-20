export const tripRelations = {
  imageLinks: { orderBy: { position: "asc" } },
  documents: { orderBy: { position: "asc" } },
  tasks: { orderBy: { position: "asc" } },
  packingItems: { orderBy: { position: "asc" } },
  accommodations: { orderBy: { position: "asc" } },
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
    departureDate: trip.departureDate,
    returnDate: trip.returnDate,
    status: trip.status,
    imageLinks: trip.imageLinks?.map((item) => item.url) || [],
    documents: trip.documents?.map((item) => item.title) || [],
    tasks: trip.tasks?.map(toChecklistResponse) || [],
    packingList: trip.packingItems?.map(toChecklistResponse) || [],
    hasInsurance: trip.hasInsurance,
    insuranceTicket: trip.insuranceTicket,
    transportType: trip.transportType,
    transport: trip.transport,
    reservationCode: trip.reservationCode,
    locator: trip.locator,
    accommodation: trip.accommodation,
    accommodationDates: trip.accommodationDates,
    accommodationLink: trip.accommodationLink,
    accommodationAddress: trip.accommodationAddress,
    accommodationDirections: trip.accommodationDirections,
    accommodations: trip.accommodations?.map(toAccommodationResponse) || legacyAccommodationResponse(trip),
    internalTransport: trip.internalTransport,
    itineraryMarkdown: trip.itineraryMarkdown,
    diaryEntries: trip.diaryEntries?.map(toDiaryEntryResponse) || [],
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  };
}

function toAccommodationResponse(item) {
  return {
    id: item.id,
    destination: item.destination,
    name: item.name,
    dates: item.dates,
    checkInAt: item.checkInAt,
    checkOutAt: item.checkOutAt,
    link: item.link,
    address: item.address,
    position: item.position,
    createdAt: item.createdAt
  };
}

function legacyAccommodationResponse(trip) {
  if (!trip.accommodation) {
    return [];
  }

  return [{
    destination: trip.destination || "",
    name: trip.accommodation,
    dates: trip.accommodationDates || "",
    checkInAt: null,
    checkOutAt: null,
    link: trip.accommodationLink || "",
    address: trip.accommodationAddress || "",
    position: 0
  }];
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
    name: trip.name,
    destination: trip.destination,
    period: trip.period,
    departureDate: trip.departureDate,
    returnDate: trip.returnDate,
    status: trip.status,
    hasInsurance: trip.hasInsurance,
    insuranceTicket: trip.insuranceTicket,
    transportType: trip.transportType,
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

export function toAccommodationCreateMany(accommodations) {
  return accommodations.map((item, position) => ({
    destination: item.destination,
    name: item.name || "Hospedagem",
    dates: item.dates,
    checkInAt: item.checkInAt,
    checkOutAt: item.checkOutAt,
    link: item.link,
    address: item.address,
    position
  }));
}
