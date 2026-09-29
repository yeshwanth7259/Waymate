import { fetchApi, ApiResponse } from './api';

export const authApi = {
  syncUser: (getAccessToken: () => string | null): Promise<ApiResponse<any>> => {
    return fetchApi('/auth/sync', { method: 'POST' }, getAccessToken);
  },
};
