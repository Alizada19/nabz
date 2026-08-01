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

export const donorsService = {
  async findNearby(query: NearbyDonorsQuery): Promise<ApiResponse<PaginatedResult<MatchedDonor>>> {
    const res = await client.get<ApiResponse<PaginatedResult<MatchedDonor>>>('/donors/nearby', {
      params: query,
    });
    return res.data;
  },
};
