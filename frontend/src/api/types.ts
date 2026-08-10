export type Role = 'admin' | 'individual' | 'hospital' | 'blood_bank' | 'ngo';

export type RequestStatus = 'pending' | 'matched' | 'completed' | 'cancelled';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RequestType = 'INDIVIDUAL' | 'HOSPITAL' | 'BLOOD_BANK' | 'NGO';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  donorProfile?: DonorProfile | null;
}

export interface BloodType {
  id: string;
  name: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodTypeId: string;
  lastDonationDate: string | null;
  totalDonations: number;
  availableStatus: boolean;
  createdAt: string;
  updatedAt: string;
  bloodType?: BloodType;
  user?: User;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  bloodTypeId: string;
  requestType: RequestType;
  hospitalName?: string | null;
  hospitalAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  unitsRequired?: number | null;
  urgencyLevel: UrgencyLevel;
  status: RequestStatus;

  // Custom requester type fields
  requesterPhone?: string | null;
  preferredHospital?: string | null;
  additionalNotes?: string | null;
  coordinatorName?: string | null;
  coordinatorContact?: string | null;

  createdAt: string;
  updatedAt: string;
  requester?: User;
  bloodType?: BloodType;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface MatchedDonor {
  name: string;
  bloodType: string;
  distanceKm: number;
  location: string | null;
  isAvailable: boolean;
}
