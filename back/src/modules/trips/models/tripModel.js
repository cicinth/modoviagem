import { AppError } from "../../../shared/errors/AppError.js";

export const TRIP_STATUSES = {
  NEXT: "proxima",
  FINISHED: "finalizada"
};

export const defaultPackingList = [
  { text: "Passaporte ou documento", done: false },
  { text: "Carregador", done: false },
  { text: "Seguro viagem", done: false },
  { text: "Remédios pessoais", done: false },
  { text: "Roupas confortáveis", done: false }
];

function asText(value) {
  return String(value || "").trim();
}

export function asList(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function asChecklist(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return { text: item.trim(), done: false };
        }

        return {
          text: asText(item?.text),
          done: Boolean(item?.done)
        };
      })
      .filter((item) => item.text);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ text: item, done: false }));
  }

  return [];
}

export function normalizeTripInput(input = {}, existing = null) {
  const fallback = existing || {};

  return {
    userId: input.userId ?? fallback.userId ?? null,
    name: asText(input.name ?? fallback.name),
    destination: asText(input.destination ?? fallback.destination),
    period: asText(input.period ?? fallback.period),
    status: normalizeStatus(input.status ?? fallback.status),
    imageLinks: asList(input.imageLinks ?? fallback.imageLinks),
    documents: asList(input.documents ?? fallback.documents),
    tasks: asChecklist(input.tasks ?? fallback.tasks),
    packingList: asChecklist(input.packingList ?? fallback.packingList ?? defaultPackingList),
    hasInsurance: Boolean(input.hasInsurance ?? fallback.hasInsurance),
    insuranceTicket: asText(input.insuranceTicket ?? fallback.insuranceTicket),
    transport: asText(input.transport ?? fallback.transport),
    reservationCode: asText(input.reservationCode ?? fallback.reservationCode),
    locator: asText(input.locator ?? fallback.locator),
    accommodation: asText(input.accommodation ?? fallback.accommodation),
    accommodationDates: asText(input.accommodationDates ?? fallback.accommodationDates),
    accommodationLink: asText(input.accommodationLink ?? fallback.accommodationLink),
    accommodationAddress: asText(input.accommodationAddress ?? fallback.accommodationAddress),
    accommodationDirections: asText(input.accommodationDirections ?? fallback.accommodationDirections),
    internalTransport: asText(input.internalTransport ?? fallback.internalTransport),
    itineraryMarkdown: asText(input.itineraryMarkdown ?? fallback.itineraryMarkdown)
  };
}

export function normalizeStatus(status) {
  if (status === TRIP_STATUSES.FINISHED) {
    return TRIP_STATUSES.FINISHED;
  }

  return TRIP_STATUSES.NEXT;
}

export function validateTrip(trip) {
  if (!trip.name) {
    throw new AppError("Informe o nome da viagem", 400);
  }
}
