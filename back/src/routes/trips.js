import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTripById,
  listTrips,
  updateTrip
} from "../storage/tripRepository.js";

export const tripsRouter = Router();

tripsRouter.get("/", async (_request, response, next) => {
  try {
    response.json(await listTrips());
  } catch (error) {
    next(error);
  }
});

tripsRouter.get("/:id", async (request, response, next) => {
  try {
    const trip = await getTripById(request.params.id);

    if (!trip) {
      response.status(404).json({ message: "Viagem não encontrada" });
      return;
    }

    response.json(trip);
  } catch (error) {
    next(error);
  }
});

tripsRouter.post("/", async (request, response, next) => {
  try {
    const trip = await createTrip(request.body);
    response.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

tripsRouter.put("/:id", async (request, response, next) => {
  try {
    const trip = await updateTrip(request.params.id, request.body);

    if (!trip) {
      response.status(404).json({ message: "Viagem não encontrada" });
      return;
    }

    response.json(trip);
  } catch (error) {
    next(error);
  }
});

tripsRouter.patch("/:id/finalize", async (request, response, next) => {
  try {
    const trip = await updateTrip(request.params.id, { status: "finalizada" });

    if (!trip) {
      response.status(404).json({ message: "Viagem não encontrada" });
      return;
    }

    response.json(trip);
  } catch (error) {
    next(error);
  }
});

tripsRouter.delete("/:id", async (request, response, next) => {
  try {
    const removed = await deleteTrip(request.params.id);

    if (!removed) {
      response.status(404).json({ message: "Viagem não encontrada" });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
