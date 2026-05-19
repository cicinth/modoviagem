export class TripDiaryController {
  constructor(tripDiaryService) {
    this.tripDiaryService = tripDiaryService;
  }

  list = async (request, response, next) => {
    try {
      const entries = await this.tripDiaryService.listDiaryEntries(request.params.tripId, request.user.id);

      if (entries === null) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.json(entries);
    } catch (error) {
      next(error);
    }
  };

  create = async (request, response, next) => {
    try {
      const entry = await this.tripDiaryService.createDiaryEntry(request.params.tripId, request.user.id, request.body);

      if (!entry) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  };

  update = async (request, response, next) => {
    try {
      const entry = await this.tripDiaryService.updateDiaryEntry(
        request.params.tripId,
        request.user.id,
        request.params.entryId,
        request.body
      );

      if (!entry) {
        response.status(404).json({ message: "Memória não encontrada" });
        return;
      }

      response.json(entry);
    } catch (error) {
      next(error);
    }
  };

  remove = async (request, response, next) => {
    try {
      const removed = await this.tripDiaryService.deleteDiaryEntry(
        request.params.tripId,
        request.user.id,
        request.params.entryId
      );

      if (!removed) {
        response.status(404).json({ message: "Memória não encontrada" });
        return;
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
