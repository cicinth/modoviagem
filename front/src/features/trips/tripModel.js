export const emptyTrip = {
  name: "",
  destination: "",
  period: "",
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
  transport: "",
  reservationCode: "",
  locator: "",
  accommodation: "",
  accommodationDates: "",
  accommodationLink: "",
  accommodationAddress: "",
  accommodationDirections: "",
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

export function toFormState(trip = emptyTrip) {
  return {
    ...emptyTrip,
    ...trip,
    imageLinksText: listToText(trip.imageLinks || emptyTrip.imageLinks),
    documentsText: listToText(trip.documents || emptyTrip.documents),
    tasksText: listToText(trip.tasks || emptyTrip.tasks),
    packingListText: listToText(trip.packingList || emptyTrip.packingList)
  };
}

export function toPayload(form) {
  return {
    ...form,
    imageLinks: textToList(form.imageLinksText),
    documents: textToList(form.documentsText),
    tasks: textToChecklist(form.tasksText),
    packingList: textToChecklist(form.packingListText)
  };
}
