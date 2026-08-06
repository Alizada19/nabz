import { client } from './client';
import { ApiResponse } from './types';

export interface BloodInventoryItem {
  id: string;
  bloodTypeId: string;
  unitsStored: number;
  minThreshold: number;
  createdAt: string;
  updatedAt: string;
  bloodType?: {
    id: string;
    name: string;
  };
}

export interface UpdateInventoryDto {
  bloodType: string;
  unitsStored: number;
  minThreshold: number;
}

export const bloodInventoryService = {
  async findAll(): Promise<ApiResponse<BloodInventoryItem[]>> {
    const res = await client.get<ApiResponse<BloodInventoryItem[]>>('/blood-inventory');
    return res.data;
  },

  async update(dto: UpdateInventoryDto): Promise<ApiResponse<BloodInventoryItem>> {
    const res = await client.patch<ApiResponse<BloodInventoryItem>>('/blood-inventory', dto);
    return res.data;
  },
};
