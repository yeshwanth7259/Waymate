import { LocationStore } from './location.store';
import { LocationUpdate } from '../trips/location.types';

export class InMemoryLocationStore implements LocationStore {
  private locations = new Map<string, LocationUpdate>();

  async set(tripId: string, location: LocationUpdate): Promise<void> {
    this.locations.set(tripId, location);
  }

  async get(tripId: string): Promise<LocationUpdate | null> {
    return this.locations.get(tripId) || null;
  }

  async delete(tripId: string): Promise<void> {
    this.locations.delete(tripId);
  }
}

// Singleton instance for the application
export const locationStore = new InMemoryLocationStore();
