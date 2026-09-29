import Constants from 'expo-constants';

// For local testing on physical device, we can't use localhost. 
// We use the EXPO_PUBLIC_API_BASE_URL which should be set to your computer's IP address.
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.x:3001/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // In a real app we would get the Firebase token here and attach it
  const token = ''; // TODO: get from Firebase Auth
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};
