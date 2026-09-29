export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export const validateLocation = (location: any): location is LocationUpdate => {
  if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) return false;
  if (typeof location.longitude !== 'number' || location.longitude < -180 || location.longitude > 180) return false;
  if (location.accuracy !== undefined && (typeof location.accuracy !== 'number' || location.accuracy < 0)) return false;
  if (location.speed !== undefined && (typeof location.speed !== 'number' || location.speed < 0)) return false;
  if (location.heading !== undefined && (typeof location.heading !== 'number' || location.heading < 0 || location.heading >= 360)) return false;
  
  if (typeof location.timestamp !== 'string') return false;
  const date = new Date(location.timestamp);
  if (isNaN(date.getTime())) return false;

  return true;
};
