import { client } from './client';
import { ApiResponse, User } from './types';

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async register(data: any): Promise<ApiResponse<AuthResponseData>> {
    const res = await client.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data;
  },

  async login(data: any): Promise<ApiResponse<AuthResponseData>> {
    const res = await client.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await client.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const res = await client.get<ApiResponse<User>>('/auth/profile');
    return res.data;
  },
};
