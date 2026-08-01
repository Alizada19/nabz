import { client } from './client';
import { ApiResponse, BloodType } from './types';

export const bloodTypesService = {
  async getAll(): Promise<ApiResponse<BloodType[]>> {
    const res = await client.get<ApiResponse<BloodType[]>>('/blood-types');
    return res.data;
  },
};
