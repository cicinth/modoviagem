import { normalizeDiaryEntryInput, validateDiaryEntry } from "../models/diaryModel.js";

export class TripDiaryService {
  constructor(tripRepository) {
    this.tripRepository = tripRepository;
  }

  async listDiaryEntries(tripId, userId) {
    return this.tripRepository.findDiaryEntries(tripId, userId);
  }

  async createDiaryEntry(tripId, userId, input) {
    const entry = normalizeDiaryEntryInput(input);
    validateDiaryEntry(entry);
    return this.tripRepository.createDiaryEntry(tripId, userId, entry);
  }

  async updateDiaryEntry(tripId, userId, entryId, input) {
    const entry = normalizeDiaryEntryInput(input);
    validateDiaryEntry(entry);
    return this.tripRepository.updateDiaryEntry(tripId, userId, entryId, entry);
  }

  async deleteDiaryEntry(tripId, userId, entryId) {
    return this.tripRepository.deleteDiaryEntry(tripId, userId, entryId);
  }
}
