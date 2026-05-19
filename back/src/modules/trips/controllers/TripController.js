export class TripController {
  constructor(tripService) {
    this.tripService = tripService;
  }

  list = async (request, response, next) => {
    try {
      response.json(await this.tripService.listTrips(request.user.id));
    } catch (error) {
      next(error);
    }
  };

  getById = async (request, response, next) => {
    try {
      const trip = await this.tripService.getTripById(request.params.id, request.user.id);

      if (!trip) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.json(trip);
    } catch (error) {
      next(error);
    }
  };

  create = async (request, response, next) => {
    try {
      const trip = await this.tripService.createTrip(request.user.id, request.body);
      response.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  };

  update = async (request, response, next) => {
    try {
      const trip = await this.tripService.updateTrip(request.params.id, request.user.id, request.body);

      if (!trip) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.json(trip);
    } catch (error) {
      next(error);
    }
  };

  finalize = async (request, response, next) => {
    try {
      const trip = await this.tripService.finalizeTrip(request.params.id, request.user.id);

      if (!trip) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.json(trip);
    } catch (error) {
      next(error);
    }
  };

  remove = async (request, response, next) => {
    try {
      const removed = await this.tripService.deleteTrip(request.params.id, request.user.id);

      if (!removed) {
        response.status(404).json({ message: "Viagem não encontrada" });
        return;
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
