import { LocationUpdate } from '../trips/location.types';

export interface LocationStore {
  set(tripId: string, location: LocationUpdate): Promise<void>;
  get(tripId: string): Promise<LocationUpdate | null>;
  delete(tripId: string): Promise<void>;
}
