export const emptyTrip = {
  name: "",
  destination: "",
  period: "",
  departureDate: "",
  returnDate: "",
  status: "proxima",
  imageLinks: [],
  documents: [],
  tasks: [],
  packingList: [
    { text: "Passaporte ou documento", done: false },
    { text: "Carregador", done: false },
    { text: "Seguro viagem", done: false },
    { text: "Remédios pessoais", done: false },
    { text: "Roupas confortáveis", done: false }
  ],
  hasInsurance: false,
  insuranceTicket: "",
  transportType: "",
  transport: "",
  reservationCode: "",
  locator: "",
  accommodation: "",
  accommodationDates: "",
  accommodationLink: "",
  accommodationAddress: "",
  accommodationDirections: "",
  accommodations: [],
  internalTransport: "",
  itineraryMarkdown: ""
};

export function listToText(value) {
  return Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : item.text)).join("\n") : "";
}

export function textToList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function textToChecklist(value) {
  return textToList(value).map((text) => ({ text, done: false }));
}

export function normalizeChecklist(items) {
  return (items || []).map((item) => (typeof item === "string" ? { text: item, done: false } : item));
}

export const emptyAccommodation = {
  destination: "",
  name: "",
  dates: "",
  checkInAt: "",
  checkOutAt: "",
  link: "",
  address: ""
};

export function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function toDateTimeInputValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatTripPeriod(trip = emptyTrip) {
  const departure = toDateInputValue(trip.departureDate);
  const tripReturn = toDateInputValue(trip.returnDate);

  const formatDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  if (departure && tripReturn) {
    return `${formatDate(departure)} a ${formatDate(tripReturn)}`;
  }

  return formatDate(departure) || formatDate(tripReturn) || trip.period || "Período a definir";
}

export function normalizeAccommodations(trip = emptyTrip) {
  if (Array.isArray(trip.accommodations) && trip.accommodations.length) {
    return trip.accommodations.map((item) => ({
      ...emptyAccommodation,
      destination: item.destination || "",
      name: item.name || "",
      dates: item.dates || "",
      checkInAt: toDateTimeInputValue(item.checkInAt),
      checkOutAt: toDateTimeInputValue(item.checkOutAt),
      link: item.link || "",
      address: item.address || ""
    }));
  }

  if (trip.accommodation) {
    return [{
      destination: trip.destination || "",
      name: trip.accommodation || "",
      dates: trip.accommodationDates || "",
      checkInAt: "",
      checkOutAt: "",
      link: trip.accommodationLink || "",
      address: trip.accommodationAddress || ""
    }];
  }

  return [];
}

export function toFormState(trip = emptyTrip) {
  return {
    ...emptyTrip,
    ...trip,
    imageLinksText: listToText(trip.imageLinks || emptyTrip.imageLinks),
    documentsText: listToText(trip.documents || emptyTrip.documents),
    tasksText: listToText(trip.tasks || emptyTrip.tasks),
    packingListText: listToText(trip.packingList || emptyTrip.packingList),
    departureDate: toDateInputValue(trip.departureDate),
    returnDate: toDateInputValue(trip.returnDate),
    accommodations: normalizeAccommodations(trip)
  };
}

export function toPayload(form) {
  const accommodations = (form.accommodations || [])
    .map((item) => ({
      destination: item.destination?.trim() || "",
      name: item.name?.trim() || "",
      dates: item.dates?.trim() || "",
      checkInAt: item.checkInAt || null,
      checkOutAt: item.checkOutAt || null,
      link: item.link?.trim() || "",
      address: item.address?.trim() || ""
    }))
    .filter((item) => item.destination || item.name || item.dates || item.checkInAt || item.checkOutAt || item.link || item.address);
  const firstAccommodation = accommodations[0] || emptyAccommodation;
  const period = formatTripPeriod({
    ...form,
    period: "",
    departureDate: form.departureDate,
    returnDate: form.returnDate
  });

  return {
    ...form,
    period: period === "Período a definir" ? "" : period,
    departureDate: form.departureDate || null,
    returnDate: form.returnDate || null,
    insuranceTicket: form.hasInsurance ? form.insuranceTicket : "",
    transport: form.transportType === "aviao" ? form.transport : "",
    reservationCode: form.transportType === "aviao" ? form.reservationCode : "",
    locator: form.transportType === "aviao" ? form.locator : "",
    accommodation: firstAccommodation.name || "",
    accommodationDates: firstAccommodation.dates || "",
    accommodationLink: firstAccommodation.link || "",
    accommodationAddress: firstAccommodation.address || "",
    accommodationDirections: "",
    accommodations,
    imageLinks: textToList(form.imageLinksText),
    documents: textToList(form.documentsText),
    tasks: textToChecklist(form.tasksText),
    packingList: textToChecklist(form.packingListText)
  };
}
