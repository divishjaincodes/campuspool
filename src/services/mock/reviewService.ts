import { Review, Booking } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, initStorageIfEmpty } from '../mockStorage';
import { INITIAL_REVIEWS } from '../../data/mockData';
import { authService } from './authService';

export const reviewService = {
  getReviewsForUser: (userId: string): Review[] => {
    initStorageIfEmpty();
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return reviews.filter((r) => r.reviewedUserId === userId);
  },

  getUserRatingSummary: (userId: string): { average: number; count: number } => {
    const reviews = reviewService.getReviewsForUser(userId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length,
    };
  },

  addReview: async (params: {
    rideId: string;
    reviewerId: string;
    reviewedUserId: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    initStorageIfEmpty();
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

    // Prevent duplicate review for the same ride & reviewer
    const existing = reviews.find(
      (r) => r.rideId === params.rideId && r.reviewerId === params.reviewerId
    );
    if (existing) {
      throw new Error('You have already submitted a review for this journey.');
    }

    const users = authService.getAllUsers();
    const reviewer = users.find((u) => u.id === params.reviewerId);

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      rideId: params.rideId,
      reviewerId: params.reviewerId,
      reviewerName: reviewer?.fullName || 'Student',
      reviewedUserId: params.reviewedUserId,
      rating: Math.min(5, Math.max(1, params.rating)),
      comment: params.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setStorage(STORAGE_KEYS.REVIEWS, [newReview, ...reviews]);
    return newReview;
  },
};
