import { client } from './client';
import { ApiResponse, BloodRequest, PaginatedResult } from './types';

export interface CreateBloodRequestDto {
  bloodType: string;
  hospitalName: string;
  hospitalAddress: string;
  latitude: number;
  longitude: number;
  unitsRequired: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface QueryBloodRequestDto {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const bloodRequestsService = {
  async create(dto: CreateBloodRequestDto): Promise<ApiResponse<BloodRequest>> {
    const res = await client.post<ApiResponse<BloodRequest>>('/blood-requests', dto);
    return res.data;
  },

  async findMine(query: QueryBloodRequestDto = {}): Promise<ApiResponse<PaginatedResult<BloodRequest>>> {
    const res = await client.get<ApiResponse<PaginatedResult<BloodRequest>>>('/blood-requests/my', {
      params: query,
    });
    return res.data;
  },

  async findOne(id: string): Promise<ApiResponse<BloodRequest>> {
    const res = await client.get<ApiResponse<BloodRequest>>(`/blood-requests/${id}`);
    return res.data;
  },

  async updateStatus(id: string, status: string): Promise<ApiResponse<BloodRequest>> {
    const res = await client.patch<ApiResponse<BloodRequest>>(`/blood-requests/${id}/status`, { status });
    return res.data;
  },
};
