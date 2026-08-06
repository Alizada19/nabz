import { client } from './client';
import { ApiResponse, MatchedDonor, PaginatedResult } from './types';

export interface NearbyDonorsQuery {
  bloodType: string;
  latitude: number;
  longitude: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface DonorQuery {
  bloodType?: string;
  isAvailable?: string;
  eligibility?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDonorDto {
  name: string;
  email: string;
  phone: string;
  password?: string;
  bloodType: string;
  location?: string;
  isAvailable?: boolean;
  lastDonationDate?: string;
}

export interface UpdateDonorDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  bloodType?: string;
  location?: string;
  isAvailable?: boolean;
  lastDonationDate?: string;
}

export interface DonorDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  donorProfile?: {
    id: string;
    userId: string;
    bloodTypeId: string;
    lastDonationDate: string | null;
    totalDonations: number;
    availableStatus: boolean;
    bloodType?: {
      id: string;
      name: string;
    };
  };
}

export const donorsService = {
  // Existing compatible matching donor method
  async findNearby(query: NearbyDonorsQuery): Promise<ApiResponse<PaginatedResult<MatchedDonor>>> {
    const res = await client.get<ApiResponse<PaginatedResult<MatchedDonor>>>('/donors/nearby', {
      params: query,
    });
    return res.data;
  },

  // New CRUD endpoints for individual Donors
  async findAll(query: DonorQuery = {}): Promise<ApiResponse<PaginatedResult<DonorDetail>>> {
    const res = await client.get<ApiResponse<PaginatedResult<DonorDetail>>>('/donor-profiles/all-donors', {
      params: query,
    });
    return res.data;
  },

  async findOne(id: string): Promise<ApiResponse<DonorDetail>> {
    const res = await client.get<ApiResponse<DonorDetail>>(`/donor-profiles/all-donors/${id}`);
    return res.data;
  },

  async create(dto: CreateDonorDto): Promise<ApiResponse<DonorDetail>> {
    const res = await client.post<ApiResponse<DonorDetail>>('/donor-profiles/all-donors', dto);
    return res.data;
  },

  async update(id: string, dto: UpdateDonorDto): Promise<ApiResponse<DonorDetail>> {
    const res = await client.patch<ApiResponse<DonorDetail>>(`/donor-profiles/all-donors/${id}`, dto);
    return res.data;
  },

  async remove(id: string): Promise<ApiResponse<void>> {
    const res = await client.delete<ApiResponse<void>>(`/donor-profiles/all-donors/${id}`);
    return res.data;
  },
};
