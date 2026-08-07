import { client } from './client';
import { ApiResponse, BloodRequest, PaginatedResult } from './types';

export interface CreateBloodRequestDto {
  requestType?: 'INDIVIDUAL' | 'HOSPITAL' | 'BLOOD_BANK';
  bloodType: string;
  hospitalName?: string | null;
  hospitalAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  unitsRequired?: number | null;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  requesterPhone?: string | null;
  preferredHospital?: string | null;
  additionalNotes?: string | null;
  coordinatorName?: string | null;
  coordinatorContact?: string | null;
}

export interface UpdateBloodRequestDto {
  requestType?: 'INDIVIDUAL' | 'HOSPITAL' | 'BLOOD_BANK';
  bloodType?: string;
  hospitalName?: string | null;
  hospitalAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  unitsRequired?: number | null;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  requesterPhone?: string | null;
  preferredHospital?: string | null;
  additionalNotes?: string | null;
  coordinatorName?: string | null;
  coordinatorContact?: string | null;
}

export interface QueryBloodRequestDto {
  status?: string;
  urgencyLevel?: string;
  bloodType?: string;
  location?: string;
  requestType?: string;
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
