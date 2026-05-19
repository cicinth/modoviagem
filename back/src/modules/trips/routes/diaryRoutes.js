import { Router } from "express";
import { authRequired } from "../../../shared/middlewares/authRequired.js";
import { PrismaTripRepository } from "../repositories/PrismaTripRepository.js";
import { TripDiaryController } from "../controllers/TripDiaryController.js";
import { TripDiaryService } from "../services/TripDiaryService.js";

const tripRepository = new PrismaTripRepository();
const tripDiaryService = new TripDiaryService(tripRepository);
const tripDiaryController = new TripDiaryController(tripDiaryService);

export const diaryRouter = Router({ mergeParams: true });

diaryRouter.use(authRequired);
diaryRouter.get("/", tripDiaryController.list);
diaryRouter.post("/", tripDiaryController.create);
diaryRouter.put("/:entryId", tripDiaryController.update);
diaryRouter.delete("/:entryId", tripDiaryController.remove);
