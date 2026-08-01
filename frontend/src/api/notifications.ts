import { client } from './client';
import { ApiResponse, Notification, PaginatedResult } from './types';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export const notificationsService = {
  async findMine(query: PaginationQuery = {}): Promise<ApiResponse<PaginatedResult<Notification>>> {
    const res = await client.get<ApiResponse<PaginatedResult<Notification>>>('/notifications', {
      params: query,
    });
    return res.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const res = await client.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },
};
