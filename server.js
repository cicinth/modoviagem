import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(root, "data");
const tripsFile = join(dataDir, "trips.json");
const port = Number(process.env.PORT || 5173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(tripsFile, "utf8");
  } catch {
    await writeFile(tripsFile, "[]\n");
  }
}

async function readTrips() {
  await ensureDataFile();
  return JSON.parse(await readFile(tripsFile, "utf8"));
}

async function writeTrips(trips) {
  await ensureDataFile();
  await writeFile(tripsFile, `${JSON.stringify(trips, null, 2)}\n`);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": contentTypes[".json"] });
  response.end(JSON.stringify(payload));
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && url.pathname === "/api/trips") {
    sendJson(response, 200, await readTrips());
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/trips") {
    const trips = await readTrips();
    const trip = { ...(await readJsonBody(request)), id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    trips.unshift(trip);
    await writeTrips(trips);
    sendJson(response, 201, trip);
    return;
  }

  if (request.method === "PUT" && parts[0] === "api" && parts[1] === "trips" && parts[2]) {
    const trips = await readTrips();
    const index = trips.findIndex((trip) => trip.id === parts[2]);
    if (index === -1) {
      sendJson(response, 404, { error: "Viagem nao encontrada" });
      return;
    }

    trips[index] = { ...trips[index], ...(await readJsonBody(request)), updatedAt: new Date().toISOString() };
    await writeTrips(trips);
    sendJson(response, 200, trips[index]);
    return;
  }

  sendJson(response, 404, { error: "Endpoint nao encontrado" });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = normalize(join(root, requested));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
    } else {
      await serveStatic(request, response);
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Viagens planner rodando em http://127.0.0.1:${port}`);
});
