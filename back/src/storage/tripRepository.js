import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(currentDir, "../../data");
const dataFile = path.join(dataDir, "trips.txt");

const defaultPackingList = [
  { text: "Passaporte ou documento", done: false },
  { text: "Carregador", done: false },
  { text: "Seguro viagem", done: false },
  { text: "Remédios pessoais", done: false },
  { text: "Roupas confortáveis", done: false }
];

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await writeFile(dataFile, "[]", "utf8");
  }
}

async function readTrips() {
  await ensureDataFile();
  const content = await readFile(dataFile, "utf8");

  if (!content.trim()) {
    return [];
  }

  return JSON.parse(content);
}

async function writeTrips(trips) {
  await ensureDataFile();
  await writeFile(dataFile, JSON.stringify(trips, null, 2), "utf8");
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function asChecklist(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return { text: item.trim(), done: false };
        }

        return {
          text: String(item?.text || "").trim(),
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

function normalizeTrip(input, existing = {}) {
  const now = new Date().toISOString();

  return {
    id: existing.id || randomUUID(),
    name: String(input.name || existing.name || "").trim(),
    destination: String(input.destination || existing.destination || "").trim(),
    period: String(input.period || existing.period || "").trim(),
    status: input.status === "finalizada" ? "finalizada" : input.status === "proxima" ? "proxima" : existing.status || "proxima",
    imageLinks: asList(input.imageLinks ?? existing.imageLinks),
    documents: asList(input.documents ?? existing.documents),
    tasks: asChecklist(input.tasks ?? existing.tasks),
    packingList: asChecklist(input.packingList ?? existing.packingList ?? defaultPackingList),
    hasInsurance: Boolean(input.hasInsurance ?? existing.hasInsurance),
    insuranceTicket: String(input.insuranceTicket || existing.insuranceTicket || "").trim(),
    transport: String(input.transport || existing.transport || "").trim(),
    reservationCode: String(input.reservationCode || existing.reservationCode || "").trim(),
    locator: String(input.locator || existing.locator || "").trim(),
    accommodation: String(input.accommodation || existing.accommodation || "").trim(),
    accommodationDates: String(input.accommodationDates || existing.accommodationDates || "").trim(),
    accommodationLink: String(input.accommodationLink || existing.accommodationLink || "").trim(),
    accommodationAddress: String(input.accommodationAddress || existing.accommodationAddress || "").trim(),
    accommodationDirections: String(input.accommodationDirections || existing.accommodationDirections || "").trim(),
    internalTransport: String(input.internalTransport || existing.internalTransport || "").trim(),
    itineraryMarkdown: String(input.itineraryMarkdown || existing.itineraryMarkdown || "").trim(),
    createdAt: existing.createdAt || now,
    updatedAt: now
  };
}

function validateTrip(trip) {
  if (!trip.name) {
    const error = new Error("Informe o nome da viagem");
    error.status = 400;
    throw error;
  }
}

export async function listTrips() {
  const trips = await readTrips();
  return trips.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getTripById(id) {
  const trips = await readTrips();
  return trips.find((trip) => trip.id === id) || null;
}

export async function createTrip(input) {
  const trips = await readTrips();
  const trip = normalizeTrip(input);
  validateTrip(trip);
  trips.push(trip);
  await writeTrips(trips);
  return trip;
}

export async function updateTrip(id, input) {
  const trips = await readTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index === -1) {
    return null;
  }

  const trip = normalizeTrip(input, trips[index]);
  validateTrip(trip);
  trips[index] = trip;
  await writeTrips(trips);
  return trip;
}

export async function deleteTrip(id) {
  const trips = await readTrips();
  const nextTrips = trips.filter((trip) => trip.id !== id);

  if (nextTrips.length === trips.length) {
    return false;
  }

  await writeTrips(nextTrips);
  return true;
}
