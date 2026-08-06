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

export interface UpdateBloodRequestDto {
  bloodType?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  latitude?: number;
  longitude?: number;
  unitsRequired?: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
}

export interface QueryBloodRequestDto {
  status?: string;
  urgencyLevel?: string;
  bloodType?: string;
  location?: string;
  requesterType?: string;
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

  async findAll(query: QueryBloodRequestDto = {}): Promise<ApiResponse<PaginatedResult<BloodRequest>>> {
    const res = await client.get<ApiResponse<PaginatedResult<BloodRequest>>>('/blood-requests', {
      params: query,
    });
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

  async update(id: string, dto: UpdateBloodRequestDto): Promise<ApiResponse<BloodRequest>> {
    const res = await client.patch<ApiResponse<BloodRequest>>(`/blood-requests/${id}`, dto);
    return res.data;
  },

  async remove(id: string): Promise<ApiResponse<void>> {
    const res = await client.delete<ApiResponse<void>>(`/blood-requests/${id}`);
    return res.data;
  },

  async updateStatus(id: string, status: string): Promise<ApiResponse<BloodRequest>> {
    const res = await client.patch<ApiResponse<BloodRequest>>(`/blood-requests/${id}/status`, { status });
    return res.data;
  },
};
