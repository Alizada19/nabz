import { client } from './client';
import { ApiResponse, User } from './types';

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  isAvailable?: boolean;
}

export const usersService = {
  async getMe(): Promise<ApiResponse<User>> {
    const res = await client.get<ApiResponse<User>>('/users/me');
    return res.data;
  },

  async updateMe(dto: UpdateUserDto): Promise<ApiResponse<User>> {
    const res = await client.patch<ApiResponse<User>>('/users/me', dto);
    return res.data;
  },
};
