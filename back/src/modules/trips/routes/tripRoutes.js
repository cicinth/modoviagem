import { Router } from "express";
import { authRequired } from "../../../shared/middlewares/authRequired.js";
import { TripController } from "../controllers/TripController.js";
import { PrismaTripRepository } from "../repositories/PrismaTripRepository.js";
import { TripService } from "../services/TripService.js";
import { diaryRouter } from "./diaryRoutes.js";

const tripRepository = new PrismaTripRepository();
const tripService = new TripService(tripRepository);
const tripController = new TripController(tripService);

export const tripsRouter = Router();

tripsRouter.use(authRequired);
tripsRouter.get("/", tripController.list);
tripsRouter.get("/:id", tripController.getById);
tripsRouter.post("/", tripController.create);
tripsRouter.put("/:id", tripController.update);
tripsRouter.patch("/:id/finalize", tripController.finalize);
tripsRouter.delete("/:id", tripController.remove);
tripsRouter.use("/:tripId/diary", diaryRouter);
