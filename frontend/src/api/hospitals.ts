import { client } from './client';
import { ApiResponse, PaginatedResult } from './types';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  createdAt: string;
}

export interface CreateHospitalDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
}

export const hospitalsService = {
  async findAll(query: { search?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<PaginatedResult<Hospital>>> {
    const res = await client.get<ApiResponse<PaginatedResult<Hospital>>>('/hospitals', {
      params: query,
    });
    return res.data;
  },

  async findOne(id: string): Promise<ApiResponse<Hospital>> {
    const res = await client.get<ApiResponse<Hospital>>(`/hospitals/${id}`);
    return res.data;
  },

  async create(dto: CreateHospitalDto): Promise<ApiResponse<Hospital>> {
    const res = await client.post<ApiResponse<Hospital>>('/hospitals', dto);
    return res.data;
  },

  async update(id: string, dto: Partial<CreateHospitalDto>): Promise<ApiResponse<Hospital>> {
    const res = await client.patch<ApiResponse<Hospital>>(`/hospitals/${id}`, dto);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const res = await client.delete<ApiResponse<void>>(`/hospitals/${id}`);
    return res.data;
  },
};
