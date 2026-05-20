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

const MAX_TEXT_LENGTH = 500;
const MAX_LONG_TEXT_LENGTH = 30_000;
const MAX_LIST_ITEMS = 100;
const MAX_URL_LENGTH = 2048;
const TRANSPORT_TYPES = ["", "aviao", "trem", "onibus", "carro", "barco", "outro"];

function asText(value) {
  return String(value || "").trim();
}

function pickField(input, fallback, field) {
  return Object.prototype.hasOwnProperty.call(input, field) ? input[field] : fallback[field];
}

function hasField(input, field) {
  return Object.prototype.hasOwnProperty.call(input, field);
}

function normalizeDate(value, field) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new AppError(`${field} inválida`, 400);
    }

    return value;
  }

  const text = asText(value);
  const dateOnlyMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnlyMatch ? new Date(`${text}T00:00:00.000Z`) : new Date(text);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${field} inválida`, 400);
  }

  return date;
}

function formatDateLabel(date) {
  if (!date) {
    return "";
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function formatDateTimeLabel(date) {
  if (!date) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function buildPeriodLabel(period, departureDate, returnDate) {
  if (period) {
    return period;
  }

  const departureLabel = formatDateLabel(departureDate);
  const returnLabel = formatDateLabel(returnDate);

  if (departureLabel && returnLabel) {
    return `${departureLabel} a ${returnLabel}`;
  }

  return departureLabel || returnLabel;
}

function buildAccommodationDatesLabel(dates, checkInAt, checkOutAt) {
  if (dates) {
    return dates;
  }

  const checkInLabel = formatDateTimeLabel(checkInAt);
  const checkOutLabel = formatDateTimeLabel(checkOutAt);

  if (checkInLabel && checkOutLabel) {
    return `${checkInLabel} a ${checkOutLabel}`;
  }

  return checkInLabel || checkOutLabel;
}

function assertMaxLength(value, field, maxLength = MAX_TEXT_LENGTH) {
  if (String(value || "").length > maxLength) {
    throw new AppError(`${field} muito longo`, 400);
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
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

export function asUrlList(value) {
  return asList(value).slice(0, MAX_LIST_ITEMS);
}

export function asChecklist(value) {
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_LIST_ITEMS)
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
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => ({ text: item, done: false }));
  }

  return [];
}

export function normalizeAccommodations(value, fallback = []) {
  const items = Array.isArray(value) ? value : fallback;

  return (items || [])
    .slice(0, 20)
    .map((item) => {
      const checkInAt = normalizeDate(item?.checkInAt, "Check-in");
      const checkOutAt = normalizeDate(item?.checkOutAt, "Check-out");

      return {
        destination: asText(item?.destination),
        name: asText(item?.name ?? item?.accommodation),
        dates: buildAccommodationDatesLabel(asText(item?.dates ?? item?.accommodationDates), checkInAt, checkOutAt),
        checkInAt,
        checkOutAt,
        link: asText(item?.link ?? item?.accommodationLink),
        address: asText(item?.address ?? item?.accommodationAddress)
      };
    })
    .filter((item) => item.name || item.destination || item.dates || item.checkInAt || item.checkOutAt || item.link || item.address);
}

export function normalizeTripInput(input = {}, existing = null) {
  const fallback = existing || {};
  const departureDate = normalizeDate(pickField(input, fallback, "departureDate"), "Data de ida");
  const returnDate = normalizeDate(pickField(input, fallback, "returnDate"), "Data de volta");
  const dateChanged = hasField(input, "departureDate") || hasField(input, "returnDate");
  const periodInput = hasField(input, "period") ? input.period : dateChanged ? "" : fallback.period;
  const period = buildPeriodLabel(asText(periodInput), departureDate, returnDate);

  return {
    userId: input.userId ?? fallback.userId ?? null,
    name: asText(input.name ?? fallback.name),
    destination: asText(input.destination ?? fallback.destination),
    period,
    departureDate,
    returnDate,
    status: normalizeStatus(input.status ?? fallback.status),
    imageLinks: asUrlList(input.imageLinks ?? fallback.imageLinks),
    documents: asList(input.documents ?? fallback.documents).slice(0, MAX_LIST_ITEMS),
    tasks: asChecklist(input.tasks ?? fallback.tasks),
    packingList: asChecklist(input.packingList ?? fallback.packingList ?? defaultPackingList),
    hasInsurance: Boolean(input.hasInsurance ?? fallback.hasInsurance),
    insuranceTicket: asText(input.insuranceTicket ?? fallback.insuranceTicket),
    transportType: normalizeTransportType(input.transportType ?? fallback.transportType),
    transport: asText(input.transport ?? fallback.transport),
    reservationCode: asText(input.reservationCode ?? fallback.reservationCode),
    locator: asText(input.locator ?? fallback.locator),
    accommodation: asText(input.accommodation ?? fallback.accommodation),
    accommodationDates: asText(input.accommodationDates ?? fallback.accommodationDates),
    accommodationLink: asText(input.accommodationLink ?? fallback.accommodationLink),
    accommodationAddress: asText(input.accommodationAddress ?? fallback.accommodationAddress),
    accommodationDirections: asText(input.accommodationDirections ?? fallback.accommodationDirections),
    accommodations: normalizeAccommodations(
      input.accommodations,
      fallback.accommodations || legacyAccommodationFromFields(input, fallback)
    ),
    internalTransport: asText(input.internalTransport ?? fallback.internalTransport),
    itineraryMarkdown: asText(input.itineraryMarkdown ?? fallback.itineraryMarkdown)
  };
}

function legacyAccommodationFromFields(input, fallback) {
  const name = asText(input.accommodation ?? fallback.accommodation);
  if (!name) return [];

  return [{
    destination: asText(input.destination ?? fallback.destination),
    name,
    dates: asText(input.accommodationDates ?? fallback.accommodationDates),
    checkInAt: null,
    checkOutAt: null,
    link: asText(input.accommodationLink ?? fallback.accommodationLink),
    address: asText(input.accommodationAddress ?? fallback.accommodationAddress)
  }];
}

export function normalizeTransportType(value) {
  const normalized = asText(value).toLowerCase();
  return TRANSPORT_TYPES.includes(normalized) ? normalized : "";
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

  assertMaxLength(trip.name, "Nome da viagem", 160);
  assertMaxLength(trip.destination, "Destino", 240);
  assertMaxLength(trip.period, "Período", 120);
  assertMaxLength(trip.insuranceTicket, "Bilhete do seguro", 160);
  assertMaxLength(trip.transport, "Transporte", 500);
  assertMaxLength(trip.reservationCode, "Número da reserva", 160);
  assertMaxLength(trip.locator, "Localizador", 160);
  assertMaxLength(trip.accommodation, "Hospedagem", 500);
  assertMaxLength(trip.accommodationDates, "Datas da hospedagem", 160);
  assertMaxLength(trip.accommodationAddress, "Endereço da hospedagem", 500);
  assertMaxLength(trip.accommodationDirections, "Como chegar até a hospedagem", 1000);
  assertMaxLength(trip.internalTransport, "Deslocamentos internos", 2000);
  assertMaxLength(trip.itineraryMarkdown, "Roteiro", MAX_LONG_TEXT_LENGTH);

  if (trip.accommodationLink && (!isHttpUrl(trip.accommodationLink) || trip.accommodationLink.length > MAX_URL_LENGTH)) {
    throw new AppError("Informe um link de hospedagem válido", 400);
  }

  if (!TRANSPORT_TYPES.includes(trip.transportType)) {
    throw new AppError("Informe um tipo de transporte válido", 400);
  }

  if (trip.departureDate && trip.returnDate && trip.departureDate > trip.returnDate) {
    throw new AppError("Data de volta deve ser igual ou posterior à data de ida", 400);
  }

  const invalidImageLink = trip.imageLinks.find((url) => !isHttpUrl(url) || url.length > MAX_URL_LENGTH);
  if (invalidImageLink) {
    throw new AppError("Informe links de imagem válidos", 400);
  }

  const overlongDocument = trip.documents.find((item) => item.length > MAX_TEXT_LENGTH);
  if (overlongDocument) {
    throw new AppError("Documento muito longo", 400);
  }

  const overlongTask = trip.tasks.find((item) => item.text.length > MAX_TEXT_LENGTH);
  if (overlongTask) {
    throw new AppError("Tarefa muito longa", 400);
  }

  const overlongPackingItem = trip.packingList.find((item) => item.text.length > MAX_TEXT_LENGTH);
  if (overlongPackingItem) {
    throw new AppError("Item da mala muito longo", 400);
  }

  for (const accommodation of trip.accommodations) {
    assertMaxLength(accommodation.destination, "Destino da hospedagem", 240);
    assertMaxLength(accommodation.name, "Hospedagem", 500);
    assertMaxLength(accommodation.dates, "Datas da hospedagem", 160);
    assertMaxLength(accommodation.address, "Endereço da hospedagem", 500);

    if (accommodation.checkInAt && accommodation.checkOutAt && accommodation.checkInAt > accommodation.checkOutAt) {
      throw new AppError("Check-out deve ser igual ou posterior ao check-in", 400);
    }

    if (accommodation.link && (!isHttpUrl(accommodation.link) || accommodation.link.length > MAX_URL_LENGTH)) {
      throw new AppError("Informe links de hospedagem válidos", 400);
    }
  }
}
