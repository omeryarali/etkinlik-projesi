export type AuthUser = {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  token: string;
};

export type EventSummary = {
  id: number;
  organizerProfileId: number;
  organizerName: string;
  eventCategoryId: number;
  categoryName: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  city: string;
  district: string;
  locationName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  participantCount: number;
  isPaid: boolean;
  price?: number | null;
  coverImageUrl: string;
  rules: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
};

export type OrganizerProfile = {
  id: number;
  userId: number;
  organizerName: string;
  organizerType: string;
  description: string;
  phoneNumber: string;
  instagramUrl?: string;
  city: string;
  district: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string | null;
};

export type ParticipantItem = {
  userId: number;
  fullName: string;
  email: string;
  joinedAt: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
