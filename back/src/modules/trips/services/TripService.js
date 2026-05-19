import { normalizeTripInput, TRIP_STATUSES, validateTrip } from "../models/tripModel.js";

export class TripService {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async listTrips(userId) {
    return this.tripRepository.findAll(userId);
  }

  async getTripById(id, userId) {
    return this.tripRepository.findById(id, userId);
  }

  async createTrip(userId, input) {
    const trip = normalizeTripInput(input);
    validateTrip(trip);

    return this.tripRepository.create(userId, trip);
  }

  async updateTrip(id, userId, input) {
    const existingTrip = await this.tripRepository.findById(id, userId);

    if (!existingTrip) {
      return null;
    }

    const trip = normalizeTripInput(input, existingTrip);
    validateTrip(trip);

    return this.tripRepository.update(id, userId, trip);
  }

  async finalizeTrip(id, userId) {
    return this.updateTrip(id, userId, { status: TRIP_STATUSES.FINISHED });
  }

  async deleteTrip(id, userId) {
    return this.tripRepository.delete(id, userId);
  }
}
