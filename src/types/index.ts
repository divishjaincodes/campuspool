export type Gender = 'female' | 'male' | 'undisclosed';

export type UserRole = 'student' | 'admin';

export type VerificationStatus = 'demo' | 'pending' | 'verified';

export interface Vehicle {
  type: 'Car' | 'SUV' | 'Sedan' | 'Hatchback' | 'Other';
  model?: string;
  capacity: number;
  regNumberPrivate?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  college: string;
  regNumber?: string;
  gender: Gender;
  phone?: string;
  bio?: string;
  vehicle?: Vehicle;
  isSuspended?: boolean;
  verificationStatus: VerificationStatus;
  role: UserRole;
  createdAt: string;
}

export type PricingType = 'fixed' | 'shared';

export type GenderPreference = 'everyone' | 'women_only' | 'men_only';

export type RideStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface Ride {
  id: string;
  creatorId: string;
  creator?: User;
  origin: string;
  destination: string;
  intermediateStops?: string[];
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  estimatedDuration?: string;
  vehicleType: string;
  vehicleModel?: string;
  totalCapacity: number;
  seatsOffered: number;
  seatsRemaining: number;
  pricingType: PricingType;
  pricePerSeat: number; // for fixed or calculated shared
  totalTripCost?: number; // for shared
  contributingPassengersCount?: number; // for shared
  genderPreference: GenderPreference;
  luggageAllowance: 'none' | 'small' | 'medium' | 'large';
  acAvailable: boolean;
  smokingAllowed: boolean;
  notes?: string;
  status: RideStatus;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  rideId: string;
  ride?: Ride;
  passengerId: string;
  passenger?: User;
  seatsBooked: number;
  totalContribution: number;
  status: BookingStatus;
  message?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  rideId: string;
  rideTitle: string;
  participantIds: string[];
  participants?: User[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'ride_cancelled'
  | 'new_message'
  | 'safety_update';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  rideId: string;
  reviewerId: string;
  reviewerName?: string;
  reviewedUserId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export type ReportCategory =
  | 'inappropriate_behaviour'
  | 'fare_dispute'
  | 'safety_concern'
  | 'overcrowding'
  | 'no_show'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  rideId?: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  resolutionNote?: string;
  createdAt: string;
}
