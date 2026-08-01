import { client } from './client';
import { ApiResponse, DonorProfile } from './types';

export interface CreateDonorProfileDto {
  bloodType: string;
}

export interface UpdateDonorProfileDto {
  bloodType?: string;
  availableStatus?: boolean;
  lastDonationDate?: string | null;
}

export const donorProfilesService = {
  async create(dto: CreateDonorProfileDto): Promise<ApiResponse<DonorProfile>> {
    const res = await client.post<ApiResponse<DonorProfile>>('/donor-profiles', dto);
    return res.data;
  },

  async getMine(): Promise<ApiResponse<DonorProfile>> {
    const res = await client.get<ApiResponse<DonorProfile>>('/donor-profiles/me');
    return res.data;
  },

  async updateMine(dto: UpdateDonorProfileDto): Promise<ApiResponse<DonorProfile>> {
    const res = await client.patch<ApiResponse<DonorProfile>>('/donor-profiles/me', dto);
    return res.data;
  },

  async updateLocation(coords: { latitude: number; longitude: number }): Promise<ApiResponse<DonorProfile>> {
    const res = await client.patch<ApiResponse<DonorProfile>>('/donor-profiles/me/location', coords);
    return res.data;
  },
};
